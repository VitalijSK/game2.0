const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bluebird = require('bluebird');
const config = require('./config/index');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const errorHandler = require('./middlewares/errorHandler');
var p2 = require('p2'); 
var physicsPlayer = require('./server/physics/playermovement.js');


var player_lst = [];
var attack_lst = [];

//needed for physics update 
var startTime = (new Date).getTime();
var lastTime;
var timeStep= 1/70; 

//the physics world in the server. This is where all the physics happens. 
//we set gravity to 0 since we are just following mouse pointers.
var world = new p2.World({
  gravity : [0,0]
});

//a player class in the server
var Player = function (startX, startY) {
  this.x = startX
  this.y = startY
  this.health = 100;
  //We need to intilaize with true.
  this.sendData = true;
}
var Attack = function (data) {
  this.x = data.x
  this.y = data.y
  this.rad = data.rad
}

//We call physics handler 60fps. The physics is calculated here. 
setInterval(physics_hanlder, 1000/60);

//Steps the physics world. 
function physics_hanlder() {
	var currentTime = (new Date).getTime();
	timeElapsed = currentTime - startTime;
	var dt = lastTime ? (timeElapsed - lastTime) / 1000 : 0;
    dt = Math.min(1 / 10, dt);
    world.step(timeStep);
}


// when a new player connects, we make a new instance of the player object,
// and send a new player message to the client. 
function onNewplayer (data) {
	console.log('---');
	console.log(data);
	//new player instance
	var newPlayer = new Player(data.x, data.y);
	
	//create an instance of player body 
	playerBody = new p2.Body ({
		mass: 0,
		position: [0,0],
		fixedRotation: true
	});
	
	//add the playerbody into the player object 
	newPlayer.playerBody = playerBody;
	world.addBody(newPlayer.playerBody);
	
	console.log("created new player with id " + this.id);
	newPlayer.id = this.id; 	
	//information to be sent to all clients except sender
	var current_info = {
		id: newPlayer.id, 
		x: newPlayer.x,
		y: newPlayer.y,
	}; 
	
	//send to the new player about everyone who is already connected. 	
	for (i = 0; i < player_lst.length; i++) {
		existingPlayer = player_lst[i];
		var player_info = {
			id: existingPlayer.id,
			x: existingPlayer.x,
			y: existingPlayer.y, 		
		};
		console.log("pushing player");
		//send message to the sender-client only
		this.emit("new_enemyPlayer", player_info);
	}
	
	//send message to every connected client except the sender
	this.broadcast.emit('new_enemyPlayer', current_info);
	

	player_lst.push(newPlayer); 
}


function attackPlayer(data) {
	var Player = find_playerid(data.id); 
	if (!Player) {
		return;
		console.log('no player'); 
	}
	console.log(Player);
	Player.health -=50;
	
	if(Player.health <= 0)
	{
		this.broadcast.emit('remove_player', {id: data.id});
		this.broadcast.to(data.id).emit("killed"); 
		
		playerKilled(Player);
		this.emit('remove_player', {id: data.id}); 
		player_lst.splice(player_lst.indexOf(Player), 1);
		
	}
}
function playerKilled (player) {
	player.dead = true; 
}
//instead of listening to player positions, we listen to user inputs 
let allow = false;
function onInputFired (data) {
	
	var movePlayer = find_playerid(this.id, this.room); 
	
	if (!movePlayer) {
		return;
		console.log('no player'); 
	}

	//when sendData is true, we send the data back to client. 
	if (!movePlayer.sendData) {
		return;
	}
	
	//every 50ms, we send the data. 
	setTimeout(function() {movePlayer.sendData = true}, 50);
	//we set sendData to false when we send the data. 
	movePlayer.sendData = false;
	
	//Make a new pointer with the new inputs from the client. 
	//contains player positions in server
	var serverPointer = {
		x: data.pointer_x,
		y: data.pointer_y,
		world_x: data.world_x,
		world_y: data.world_y,
		event: data.event
	}
	movePlayer.playerBody.position[0] = 0;
	//moving the player to the new inputs from the player
	if(serverPointer.event === 'left')
	{
		movePlayer.playerBody.position[0] =-250;
	}
	else if(serverPointer.event === 'right')
	{
		movePlayer.playerBody.position[0] =250;
		
	}
	
	if(serverPointer.event === 'jump')
	{
		movePlayer.playerBody.position[1] =-350;
		allow = true;
	}
	

	
	
	//new player position to be sent back to client. 
	var info = {
		x: movePlayer.playerBody.position[0],
		y: movePlayer.playerBody.position[1],
		allow: allow
	}
	allow = false;

	//send to sender (not to every clients). 
	this.emit('input_recieved', info);
	
	//data to be sent back to everyone except sender 
	var moveplayerData = {
		id: movePlayer.id, 
		x: movePlayer.playerBody.position[0],
		y: movePlayer.playerBody.position[1],
		worldx: serverPointer.world_x,
		worldy: serverPointer.world_y,
		event:serverPointer.event,
	}

	
	//send to everyone except sender 
	this.broadcast.emit('enemy_move', moveplayerData);
}
function onPlayerCollision (data) {
	var movePlayer = find_playerid(this.id); 
	var enemyPlayer = find_playerid(data.id); 
	
	
	if (movePlayer.dead || enemyPlayer.dead)
		return
	
	if (!movePlayer || !enemyPlayer)
		return

	
	if (movePlayer.size == enemyPlayer)
		return
	//the main player size is less than the enemy size
	else if (movePlayer.size < enemyPlayer.size) {
		var gained_size = movePlayer.size / 2;
		enemyPlayer.size += gained_size; 
		this.emit("killed");
		//provide the new size the enemy will become
		this.broadcast.emit('remove_player', {id: this.id});
		this.broadcast.to(data.id).emit("gained", {new_size: enemyPlayer.size}); 
		playerKilled(movePlayer);
	} else {
		var gained_size = enemyPlayer.size / 2;
		movePlayer.size += gained_size;
		this.emit('remove_player', {id: enemyPlayer.id}); 
		this.emit("gained", {new_size: movePlayer.size}); 
		this.broadcast.to(data.id).emit("killed"); 
		//send to everyone except sender.
		this.broadcast.emit('remove_player', {id: enemyPlayer.id});
		playerKilled(enemyPlayer);
	}
	
	console.log("someone ate someone!!!");
}

function playerKilled (player) {
	player.dead = true; 
}
//call when a client disconnects and tell the clients except sender to remove the disconnected player
function onClientdisconnect() {
	console.log('disconnect'); 

	var removePlayer = find_playerid(this.id); 
		
	if (removePlayer) {
		player_lst.splice(player_lst.indexOf(removePlayer), 1);
	}
	
	console.log("removing player " + this.id);
	
	//send message to every connected client except the sender
	this.broadcast.emit('remove_player', {id: this.id});
	
}

// find player by the the unique socket id 
function find_playerid(id) {

	for (var i = 0; i < player_lst.length; i++) {

		if (player_lst[i].id == id) {
			return player_lst[i]; 
		}
	}
	
	return false; 
}

 // io connection 
var io = require('socket.io')(http);

io.sockets.on('connection', function(socket){
	console.log("socket connected"); 
	
	// listen for disconnection; 
	socket.on('disconnect', onClientdisconnect); 
	
	// listen for new player
	socket.on("new_player", onNewplayer);
	/*
	//we dont need this anymore
	socket.on("move_player", onMovePlayer);
	*/
	//listen for new player inputs. 
	socket.on("input_fired", onInputFired);
	socket.on("attack", attackPlayer);

	socket.on("player_collision", onPlayerCollision);
});



mongoose.Promise = bluebird;
const mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 'mongodb://admin:201127@ds243008.mlab.com:43008/heroku_v6fm27sw'
    config.database;
mongoose.connect(mongoUri, err =>{
  if(err)
  {
    throw err;
  }
  
  console.log('Mongo connected');
})
const port = process.env.PORT || config.port;
http.listen(port, err =>{
  if(err) throw err;
  console.log(`Server listenin on port ${port}`);
});


app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret
}));
app.use(express.static(path.join('./client')));
require('./routes/main')(app);
require('./routes/route')(app);
require('./routes/user')(app);

app.use(errorHandler);
