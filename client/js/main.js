const formRegistr = document.getElementById('formRegistr');
const formAuth = document.getElementById('formAuth');
const section = document.getElementsByTagName('section')[0];
const main = document.getElementsByTagName('main')[0];
const btnLiveCollection = main.getElementsByTagName('button');
const btnArr = Array.from(btnLiveCollection);
//style//
btnArr.forEach(function(btn){
    btn.addEventListener('mouseover', function(event){
        section.style = 'background-color:rgba(0, 0, 0, 0.52);';
    });
    btn.addEventListener('mouseout', function(event){
        section.style = 'background-color:rgba(0, 0, 0, 0);';
    });
});
document.getElementById('singup').addEventListener('click', function(){
    document.getElementById('registr').style="lefT: calc( 50vw - 200px );opacity:1;";
});
document.getElementById('singin').addEventListener('click', function(){
    document.getElementById('auth').style="right: calc( 50vw - 200px );opacity:1;";
});
//--end style//
// requery to server //
formRegistr.addEventListener('submit', function(event){
    event.preventDefault();
    const login = formRegistr.elements['name'].value;
    const password = formRegistr.elements['password'].value;
    $.ajax({
        type: 'POST',
        url: '/api/signup',
        data: {'login': login, 'password': password},
        cache: false,           
        success: function(response){
            messageUser('You was registration');
        },
        statusCode: {
            400: function() {
                messageUser( "Such a user already exists" );
            }
        }
    });
});
 
formAuth.addEventListener('submit', function(event){
    event.preventDefault();
    const login = formAuth.elements['name'].value;
    const password = formAuth.elements['password'].value;
    $.ajax({
        type: 'POST',
        url: '/api/signin',
        data: {'login': login, 'password': password},
        cache: false,           
        success: function(res){
            messageUser('all good');
            document.cookie = `token=${res}`;
            update();
        },
        statusCode: {
            400: function() {
                messageUser( "You wrong" );
            }
        }
    });
});

function update(){
    const token = get_cookie('token');
    $.ajax({
        type: 'POST',
        url: '/api/game',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("authorization", token);
          },
        cache: false,           
        success: function(res){
            messageUser('you enter');
            const {login} = res;
            startGame(login);
        },
        statusCode: {
            400: function() {
                messageUser( "Forbidden!" );
            }
        }
    });
}
//end requery///

function messageUser(message)
{
    alert(message);
}  
function get_cookie ( cookie_name )
{
  const results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}






window.onload = ()=>{
    update();
}
var game;
function startGame(login){
    document.getElementsByClassName('main')[0].hidden = true;
    document.getElementById('registr').hidden = true;
    document.getElementById('auth').hidden = true;

    //document.getElementsByTagName('body')[0].style = 'background-color:rgba(0, 0, 0, 0.52);';
    document.getElementById('game').hidden = false;

    var socket; 
    socket = io.connect();
    
    
    canvas_width = 800;
    canvas_height =600;
    
    game = new Phaser.Game(canvas_width,canvas_height, Phaser.CANVAS, 'gameDiv');
    game.state.disableVisibilityChange = true;


    
 //the enemy player list 
 var enemies = [];

 var gameProperties = { 
     gameWidth: 800,
     gameHeight: 600,
     game_elemnt: "gameDiv",
     in_game: false,
 };
 
 var main = function(game){
 };
 
 function onsocketConnected () {
     console.log("connected to server"); 
     createPlayer();
     gameProperties.in_game = true;
     // send the server our initial position and tell it we are connected
     console.log("player"); 
     socket.emit('new_player', {x: 0, y: 0});
 }
 
 // When the server notifies us of client disconnection, we find the disconnected
 // enemy and remove from our game
 function onRemovePlayer (data) {
     var removePlayer = findplayerbyid(data.id);
     // Player not found
     if (!removePlayer) {
         console.log('Player not found: ', data.id)
         return;
     }
     
     removePlayer.player.destroy();
     enemies.splice(enemies.indexOf(removePlayer), 1);
 }
 var player;
 function createPlayer () {
   // The player and its settings
   player = game.add.sprite(32, game.world.height - 150, 'dude');
    
   //  We need to enable physics on the player
   game.physics.arcade.enable(player);

   //  Player physics properties. Give the little guy a slight bounce.
   player.body.bounce.y = 0.2;
   player.body.gravity.y = 300;
   player.body.collideWorldBounds = true;

   //  Our two animations, walking left and right.
   player.animations.add('left', [0, 1, 2, 3], 10, true);
   player.animations.add('right', [5, 6, 7, 8], 10, true);



 }
 function checkOverlap(spriteA, spriteB) {

    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);

}
 function onKilled (data) {
	player.destroy();
}
 // this is the enemy class. 
 var remote_player = function (id, startx, starty, start_angle) {
     this.x = startx;
     this.y = starty;
     //this is the unique socket id. We use it as a unique name for enemy
     this.id = id;
     this.angle = start_angle;
     
     this.player = game.add.sprite(32, game.world.height - 150, 'dude');
    
     //  We need to enable physics on the player
     game.physics.arcade.enable(this.player);
  
     //  Player physics properties. Give the little guy a slight bounce.
     this.player.body.bounce.y = 0.2;
     this.player.body.gravity.y = 300;
     this.player.body.collideWorldBounds = true;
  
     //  Our two animations, walking left and right.
     this.player.animations.add('left', [0, 1, 2, 3], 10, true);
     this.player.animations.add('right', [5, 6, 7, 8], 10, true);
     this.player.mass = 20;
 }
 
 //Server will tell us when a new enemy player connects to the server.
 //We create a new enemy in our game.
 function onNewPlayer (data) {
     //enemy object 
     var new_enemy = new remote_player(data.id, data.x, data.y, data.angle); 
     enemies.push(new_enemy);
 }
 
 //Server tells us there is a new enemy movement. We find the moved enemy
 //and sync the enemy movement with the server
 function onEnemyMove (data) {
     console.log("moving enemy");
     
     var movePlayer = findplayerbyid (data.id); 
     
     if (!movePlayer) {
         return;
     }
     
     var newPointer = {
         x: data.x,
         y: data.y, 
         worldX: data.worldx,
         worldY: data.worldy, 
     }
     movePlayer.player.position.x = data.worldx;
     movePlayer.player.position.y = data.worldy;
     if(data.event === 'left')
     {
        movePlayer.player.animations.play('left');
     }
     else if(data.event === 'right')
     {    
        movePlayer.player.animations.play('right');
     }
     else 
     {    
        movePlayer.player.animations.stop();
        movePlayer.player.frame = 4;
     }
     
 }
 
 //we're receiving the calculated position from the server and changing the player position
 function onInputRecieved (data) {
     if(data.allow)
        player.body.velocity.y = data.y;
     player.body.velocity.x = data.x;
 }
 
 //This is where we use the socket id. 
 //Search through enemies list to find the right enemy of the id.
 function findplayerbyid (id) {
     for (var i = 0; i < enemies.length; i++) {
         if (enemies[i].id == id) {
             return enemies[i]; 
         }
     }
 }
 var platform, cursors;
 main.prototype = {
     preload: function() {
        game.load.image('sky', '/assets/sky.png');
        game.load.image('ground', '/assets/platform.png');
        game.load.image('star', '/assets/star.png');
        game.load.image('bomb', '/assets/bomb.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
         // physics start system
         //game.physics.p2.setImpactEvents(true);
 
     },
     
     create: function () {
        
        game.add.image(400, 300, 'sky');
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.sprite(0, 0, 'sky');
        platforms = game.add.group();
        platforms.enableBody = true;
        var ground = platforms.create(0, game.world.height - 64, 'ground');
        ground.scale.setTo(2, 2);
        ground.body.immovable = true;
        var ledge = platforms.create(400, 400, 'ground');
        ledge.body.immovable = true;
        ledge = platforms.create(-150, 250, 'ground');
        ledge.body.immovable = true;
        
        console.log("client started");
        //socket.on("connect", onsocketConnected); 
        if(socket.connect)
        {
            onsocketConnected();
        }
		//listen to new enemy connections
		socket.on("new_enemyPlayer", onNewPlayer);
		//listen to enemy movement 
		socket.on("enemy_move", onEnemyMove);
		//when received remove_player, remove the player passed; 
		socket.on('remove_player', onRemovePlayer); 
		//when the player receives the new input
        socket.on('input_recieved', onInputRecieved);
        socket.on('killed', onKilled);
       
        cursors = game.input.keyboard.createCursorKeys();
       
     },
     
     update: function () {

 
        player.body.collideWorldBounds = true;
        var hitPlatform = game.physics.arcade.collide(player, platforms);
        for (var i = 0; i < enemies.length; i++) {
            game.physics.arcade.collide(enemies[i].player, platforms);
            game.physics.arcade.collide(enemies[i].player, player);
            
            if (checkOverlap(player, enemies[i].player))
            {
                console.log('Drag the sprites. Overlapping: true');
            }
            else
            {
                console.log('Drag the sprites. Overlapping: false');
            }
        }
        player.body.velocity.x = 0;

        let event = '';
    if (cursors.left.isDown)
    {
        //  Move to the left
        //player.body.velocity.x = -150;
        event = 'left';
        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        event = 'right'
       // player.body.velocity.x = 150;
        player.animations.play('right');
    }
    else
    {
        //  Stand still
       
            event = 'stop';
    
        
        player.animations.stop();
        player.frame = 4;
    }
    if (event !== '')
   {    
        socket.emit('input_fired', {
            pointer_x: player.body.velocity.x, 
            pointer_y: player.body.velocity.y, 
            world_x: player.position.x, 
            world_y: player.position.y,
            event: event,
        });
   }
   
    if (cursors.up.isDown && player.body.touching.down && hitPlatform)
    {
        socket.emit('input_fired', {
            pointer_x: player.body.velocity.x, 
            pointer_y: player.body.velocity.y, 
            world_x: player.position.x, 
            world_y: player.position.y,
            event: 'jump',
        });
        //player.body.velocity.y = -350;
    }
    //  Allow the player to jump if they are touching the ground.
     }
 }
 
 var gameBootstrapper = {
     init: function(gameContainerElementId){
         game.state.add('main', main);
         game.state.start('main'); 
     }
 };;
 
 gameBootstrapper.init("gameDiv");

}



