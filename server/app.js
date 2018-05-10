const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bluebird = require('bluebird');
const config = require('../config/index');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const errorHandler = require('../middlewares/errorHandler');
const p2 = require('p2'); 
const physicsPlayer = require('../server/physics/playermovement.js');
const unique = require('node-uuid')
const user_stat = require('../services/UserService');
const jwt = require('jsonwebtoken');

const bots_lst = [];
const room_List = {}

function Room() {
	this.room_id;
	this.player_lst = [];
	this.max_num = 2;
}
//needed for physics update 
const startTime = (new Date).getTime();
let lastTime;
const timeStep= 1/70; 

//the physics world in the server. This is where all the physics happens. 
//we set gravity to 0 since we are just following mouse pointers.
const world = new p2.World({
  gravity : [0,0]
});

const game_setup = function() {
	//The constant number of foods in the game
	this.food_num = 10; 
	//food object list
	this.food_pickup = [];
	//game size height
	this.canvas_height = 600;
	//game size width
	this.canvas_width = 800; 
}
const game_instance = new game_setup();
//a player class in the server
const Player = function (startX, startY) {
  this.x = startX
  this.y = startY
  this.health = 100;
  //We need to intilaize with true.
  this.sendData = true;
}
const Bot = function (startX, startY) {
	this.id = unique.v4();
	this.x = startX
	this.y = startY
	this.health = 100;
	//We need to intilaize with true.
	this.sendData = true;
  }
const foodpickup = function (max_x, max_y, type, id) {
	this.x = getRndInteger(10, max_x - 10) ;
	this.y = getRndInteger(10, max_y - 10);
	this.type = type; 
	this.id = id; 
	this.powerup; 
}

//We call physics handler 60fps. The physics is calculated here. 
setInterval(heartbeat, 1000/60);
addfood(game_instance.food_num);

//Steps the physics world. 
function physics_hanlder() {
	const currentTime = (new Date).getTime();
	timeElapsed = currentTime - startTime;
	let dt = lastTime ? (timeElapsed - lastTime) / 1000 : 0;
    dt = Math.min(1 / 10, dt);
    world.step(timeStep);
}
let direction = 0, buff_x = 3, buff_y, revers = false, x_move = 0;



function heartbeat () {
	
	//the number of food that needs to be generated 
	//in this demo, we keep the food always at 100
	for (let key in room_List) {
		let room = room_List[key];
	}
	//add the food 
	
	for (let i = 0; i < bots_lst.length; i++) {
		if(bots_lst[i].x > 1000)
		{
			revers = true;

		}
		if(bots_lst[i].x < 100)
		{
			revers = false;

		}
		if(revers)
		{
			bots_lst[i].playerBody.position[0] =-50;
			bots_lst[i].x--;
		}
		else
		{
			bots_lst[i].playerBody.position[0] = 50;
			bots_lst[i].x++;
		}
		const current_info = {
			id: bots_lst[i].id, 
			x: bots_lst[i].playerBody.position[0],
			y: bots_lst[i].y,
			left: revers
		}; 
		io.emit("bot_move", current_info); 
	}
	//add the food 
	//addfood(food_generatenum);
	//physics stepping. We moved this into heartbeat
	physics_hanlder();
}
function addfood(n) {
	//return if it is not required to create food 
	if (n <= 0) {
		return; 
	}
	
	//create n number of foods to the game
	for (let i = 0; i < n; i++) {
		onNewbot(game_instance.canvas_width, game_instance.canvas_height);
	}
}
function checkfood(player)
{
	for (let i = 0; i < bots_lst.length; i++) {
		const current_info = {
			id: bots_lst[i].id, 
			x: bots_lst[i].x,
			y: bots_lst[i].y,
		}; 
		player.emit("item_update", current_info); 
	}
}
function find_food (id) {
	for (let i = 0; i < bots_lst.length; i++) {
		if (bots_lst[i].id == id) {
			return bots_lst[i]; 
		}
	}
	
	return false;
}


// when a new player connects, we make a new instance of the player object,
// and send a new player message to the client. 
function onNewplayer (data) {
	//new player instance
	const newPlayer = new Player(data.x, data.y);
	const room_id = find_Roomid(); 
	const room = room_List[room_id];
	//join the room; 
	this.room_id = room_id;
	newPlayer.skin = data.skin;
	//join the room
	this.join(this.room_id);
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
	//information to be sent to all clients except sender
	const current_info = {
		id: newPlayer.id, 
		x: newPlayer.x,
		y: newPlayer.y,
		skin: data.skin
	}; 
	const player_lst = room_List[this.room_id].player_lst;
	//send to the new player about everyone who is already connected. 	
	for (i = 0; i < player_lst.length; i++) {
		existingPlayer = player_lst[i];
		const player_info = {
			id: existingPlayer.id,
			x: existingPlayer.x,
			y: existingPlayer.y, 
			skin: existingPlayer.skin		
		};
		console.log("pushing player");
		//send message to the sender-client only
		this.emit("new_enemyPlayer", player_info);
	}

	this.broadcast.to(room_id).emit('new_enemyPlayer', current_info);
	checkfood(this);
	room.player_lst.push(newPlayer);
}

function find_Roomid() {
	for (let key in room_List) {
		let room = room_List[key];
		if (room.player_lst.length < room.max_num) {
			console.log(room.max_num);
			console.log(room.player_lst.length);
			return key;
		}
	}
	
	//did not find a room. create an extra room;
	const room_id = create_Room();
	return room_id;
}
function create_Room() {
	//create new room id;
	const new_roomid = unique.v4();
	//create a new room object
	const new_game = new Room();
	new_game.room_id = new_roomid;
	
	room_List[new_roomid] = new_game; 
	return new_roomid;
}
function onNewbot (max_x, max_y) {
	
	//new player instance
	var newBot = new Bot(getRndInteger(10, max_x - 10), getRndInteger(10, max_y - 10));
	//create an instance of player body 
	playerBody = new p2.Body ({
		mass: 0,
		position: [0,0],
		fixedRotation: true
	});
	
	//add the playerbody into the player object 
	newBot.playerBody = playerBody;
	world.addBody(newBot.playerBody); 	
	//information to be sent to all clients except sender
	bots_lst.push(newBot); 
}

function attackPlayer(data) {
	const Player = find_playerid(this.room_id, this.id);
	if (!Player) {
		return;
		console.log('no player'); 
	}
	
	Player.health -=20;
	if(Player.health <= 0)
	{
		const player_lst = room_List[this.room_id].player_lst;
		this.broadcast.to(this.room_id).emit('remove_player', {id: data.id});
		this.broadcast.to(data.id).emit("killed"); 
		
		playerKilled(Player);
		this.emit('remove_player', {id: data.id}); 
		//player_lst.splice(player_lst.indexOf(Player), 1);
		
	}
}
function attackBot(data) {
	
	const Bot = find_food(data.id); 

	if (!Bot) {
		return;
		console.log('no bot'); 
	}
	Bot.health -=10;
	if(Bot.health <= 0)
	{
		this.broadcast.emit('remove_bot', {id: data.id});
		botKilled(Bot);
		this.emit('remove_bot', {id: data.id}); 
		bots_lst.splice(bots_lst.indexOf(Bot), 1);
		
	}
}
function crossBot(data) {
	
	const Bot = find_food(data.id_bot); 
	const Player = find_playerid(this.room_id, this.id); 
	if (!Bot) {
		return;
		console.log('no bot'); 
	}
	if (!Player) {
		return;
		console.log('no player'); 
	}
	Player.health -=50;
	if(Player.health <= 0)
	{
		this.emit("killed");
		//provide the new size the enemy will become
		this.broadcast.emit('remove_player', {id: this.id});
		playerKilled(Player);
	}
}
function playerKilled (player) {
	player.dead = true; 
}
function botKilled (bot) {
	bot.dead = true; 
}
//instead of listening to player positions, we listen to user inputs 
let allow = false;
function onMoveBot(data) {
	const moveBot = find_food(data.id);
	moveBot.x = data.x;  
	moveBot.y = data.y;  
}
function onBullet()
{

}
function onSword(time)
{
	this.emit("mySword", this.id);
	this.broadcast.to(this.room_id).emit('enemySword', {id: this.id, time: time});
}
function onInputFired (data) {
	if(this.room_id !== undefined)
	{
	const movePlayer = find_playerid(this.room_id, this.id);
	
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
	const moveplayerData = {
		id: movePlayer.id, 
		x: movePlayer.playerBody.position[0],
		y: movePlayer.playerBody.position[1],
		worldx: serverPointer.world_x,
		worldy: serverPointer.world_y,
		event:serverPointer.event,
	}
		
	//send to everyone except sender 
	this.broadcast.to(this.room_id).emit('enemy_move', moveplayerData);
	}
}
function onPlayerCollision (data) {
	var movePlayer = find_playerid(this.room_id, this.id);
	var enemyPlayer = find_playerid(this.room_id, data.id); 
	
	
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
	if(this.room_id !== undefined){
		const removePlayer = find_playerid(this.room_id, this.id); 
		const player_lst = room_List[this.room_id].player_lst;
		if (removePlayer) {
			player_lst.splice(player_lst.indexOf(removePlayer), 1);
		}

		console.log("removing player " + this.id);
		if (player_lst.length <= 0) {
			delete room_List[this.room_id];
		}
		//send message to every connected client except the sender
		this.broadcast.to(this.room_id).emit('remove_player', {id: this.id});
	}
	
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// find player by the the unique socket id 
function find_playerid(room_id, id) {
	const player_lst = room_List[room_id].player_lst;
	for (let i = 0; i < player_lst.length; i++) {

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
	socket.on("move_bot", onMoveBot);
	socket.on("attack", attackPlayer);
	socket.on("attack_bot", attackBot);
	socket.on("cross_bot", crossBot);
	socket.on("fire", onBullet);
	socket.on("sword", onSword);

	socket.on("player_collision", onPlayerCollision);
});




mongoose.Promise = bluebird;
mongoose.connect(config.database, err =>{
  if(err)
  {
    throw err;
  }
  
  console.log('Mongo connected');
})

http.listen(config.port, err =>{
  if(err) throw err;
  console.log(`Server listenin on port ${config.port}`);
});


app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret
}));
app.use(express.static(path.join('../client')));
require('../routes/main')(app);
require('../routes/route')(app);
require('../routes/user')(app);

app.use(errorHandler);
