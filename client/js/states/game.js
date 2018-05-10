let game, player,map, skin, layer, bg, platform, cursors, allow = false, weapon;
 const enemies = [];
 const bots = [];
 const socket = io.connect();
 let canvas_width, canvas_height;
 if(document.body.clientWidth < 750)
 {
     canvas_width = document.body.clientWidth;
     canvas_height =document.body.clientHeight;
 }
 else{
     canvas_width = 800;
     canvas_height =600;
 }
 const gameProperties = { 
    gameWidth: canvas_width,
    gameHeight: canvas_height,
    game_elemnt: "gameDiv",
    in_game: false,
};
function onsocketConnected () {
    console.log("connected to server"); 
    gameProperties.in_game = true;
    player = eval(skin);
    game.camera.follow(player);
    socket.emit('new_player', {x: player.position.x, y: player.position.y, skin: skin});
}
function onRemovePlayer (data) {
    const removePlayer = findplayerbyid(data.id);
    if (!removePlayer) {
        console.log('Player not found: ', data.id)
        return;
    }
    
    removePlayer.player.destroy();
    enemies.splice(enemies.indexOf(removePlayer), 1);
}
function onRemoveBot (data) {
   const removeBot = finditembyid(data.id);
   if (!removeBot) {
       console.log('Player not found: ', data.id)
       return;
   }
   
   removeBot.player.destroy();
   bots.splice(bots.indexOf(removeBot), 1);
}

function checkOverlap(spriteA, spriteB) {
   const boundsA = spriteA.getBounds();
   const boundsB = spriteB.getBounds();

   return Phaser.Rectangle.intersects(boundsA, boundsB);
}
function onKilled (data) {
   player.destroy();
   game.state.start('gameover', false, false);
}

function onNewPlayer (data) {
    const new_enemy = new Remote_player(game, data.id, data.x, data.y, data.skin); 
    enemies.push(new_enemy);
}
function onNewBot (data) {
    const new_bot = new Zoobies(game, data.id, data.x, data.y); 
    bots.push(new_bot);
}

function onEnemyMove (data) {
    const movePlayer = findplayerbyid (data.id); 
    
    if (!movePlayer) {
        return;
    }
    
    const newPointer = {
        x: data.x,
        y: data.y, 
        worldX: data.worldx,
        worldY: data.worldy, 
    }
    movePlayer.player.position.x = data.worldx;
    movePlayer.player.position.y = data.worldy;
    if(data.event === 'left')
    {
       movePlayer.player.scale.x = -1; 
       movePlayer.player.anchor.setTo(0.5);
       movePlayer.player.animations.play('run');
   }
   else if(data.event === 'right')
   {    
       movePlayer.player.scale.x = 1; 
       movePlayer.player.anchor.setTo(0.5);
       movePlayer.player.animations.play('run');
   }
    else 
    {    
       movePlayer.player.animations.play('stay');
    }
    
}

function onBotMove (data) {
   if (!bots.length === 0) {
       return;
   }
   const moveBot = finditembyid (data.id); 
    
    if (!moveBot) {
        return;
    }
    moveBot.player.body.velocity.x = data.x;
    //moveBot.player.position.y = data.y;
   if(data.left)
   {
       moveBot.player.scale.x = -1; 
       moveBot.player.anchor.setTo(0.5);
       moveBot.player.animations.play('run');
   }
   else if(!data.left)
   {    
       moveBot.player.scale.x = 1; 
       moveBot.player.anchor.setTo(0.5);
       moveBot.player.animations.play('run');
   }
   else 
   {    
       moveBot.player.animations.play('stay');
   } 
}
function killPlayer(id)
{
   enemies.splice(enemies.indexOf(findplayerbyid(id)), 1);
}
//we're receiving the calculated position from the server and changing the player position
function onInputRecieved (data) {
    if(data.allow)
       player.body.velocity.y = data.y;
    player.body.velocity.x = data.x;

}

// search through food list to find the food object
function finditembyid (id) {
   for (let i = 0; i < bots.length; i++) {

       if (bots[i].id == id) {
           return bots[i]; 
       }
   }
   return false; 
}

function onitemremove (data) {
   const removeItem = finditembyid(data.id);
   bots.splice(bots.indexOf(removeItem), 1); 
   removeItem.item.destroy(true,false);
}

function findplayerbyid (id) {
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].id == id) {
           return enemies[i]; 
        }
    }
}
function player_coll (body, bodyB, shapeA, shapeB, equation) {
   console.log("collision");
   
   //the id of the collided body that player made contact with 
   const key = body.sprite.id; 
   //the type of the body the player made contact with 
   const type = body.sprite.type; 
   
   if (type == "player_body") {
       //send the player collision
       socket.emit('player_collision', {id: key}); 
   } else if (type == "food_body") {
       console.log("items food");
       socket.emit('item_picked', {id: key}); 
   }
}
function getSkin(res)
{
    let str = res.currectPerson;
    str = str.charAt(0).toUpperCase() + str.substr(1);
    const classPerson = 'new '+str+'(game)'; 
    skin = classPerson;
}

function getUser(fun){
    const token = get_cookie('token');
    $.ajax({
        type: 'POST',
        url: '/api/getUser',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("authorization", token);
          },
        cache: false,           
        success: fun,
        statusCode: {
            400: function() {
                messageUser( "Forbidden!" );
            }
        }
    });

}
function Buy(fun, value){
    const token = get_cookie('token');
    $.ajax({
        type: 'POST',
        url: '/api/buy',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("authorization", token);
            xhr.setRequestHeader("good", value);
          },
        cache: false,           
        success: fun,
        statusCode: {
            400: function() {
                messageUser( "Forbidden!" );
            }
        }
    });

}
function getCoins(res){
    const {coins} = res;
    if(res.message !== '' && res.message !== undefined)
        alert(res.message);
    setCoins(coins);
}
function setCoins(coins){
    document.getElementsByClassName('coins')[0].innerHTML = coins; 
    setCollection(); 
}
function setCollection(){
    const token = get_cookie('token');
    $.ajax({
        type: 'POST',
        url: '/api/collections',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("authorization", token);
          },
        cache: false,           
        success:setHTMLCollection,
        statusCode: {
            400: function() {
                messageUser( "Forbidden!" );
            }
        }
    });
}
function setHTMLCollection(res)
{
    const container = document.getElementsByClassName('shop_menu')[0].getElementsByClassName('butt')[0];
    container.innerHTML = '';
    for(let i = 0, n = res.length; i < n; i++)
    {
        if(res[i].buy)
        {
            if(res[i].chose)
            {
                container.innerHTML += '<div class="person"><img src="./img/persons/'+res[i].src+'" alt="person"/><div class="button"><a class="border-animation" href="#"><div data-value="'+res[i].title+'" class="border-animation__inner">You</div></a></div></div>';
            }
            else container.innerHTML += '<div class="person"><img src="./img/persons/'+res[i].src+'" alt="person"/><div class="button"><a class="border-animation" href="#"><div data-value="'+res[i].title+'" class="border-animation__inner">Chose</div></a></div></div>';
        }
        else container.innerHTML += '<div class="person"><img src="./img/persons/'+res[i].src+'" alt="person"/><div class="button"><a class="border-animation" href="#"><div data-value="'+res[i].title+'" class="border-animation__inner">Buy '+res[i].price+' coins</div></a></div></div>';
    }
    const buttonLiveCollection = document.getElementsByClassName('shop_menu')[0].getElementsByClassName('border-animation__inner');
    const buttons = Array.from(buttonLiveCollection);
    buttons.forEach(function(button){
        button.addEventListener('click', ()=>{
            console.log('click');
            Buy(getCoins, button.getAttribute('data-value'));
        });
    });
}
 function serverEmit(event)
 {
    socket.emit('input_fired', {
        pointer_x: player.body.velocity.x, 
        pointer_y: player.body.velocity.y, 
        world_x: player.position.x, 
        world_y: player.position.y,
        event: event,
    });
 }
 function shootHerou(){
    allow = true;
    let time = 0;
    weapon.trackSprite(player, 0, 0, true);
    socket.emit('fire', {});
    if(!player.body.onFloor())
    {
        time = 700;
        player.animations.play('jump_shoot');
    }
    else 
    {
        time = 350;
        player.animations.play('shoot');
    }

    setTimeout(function(){
        allow = false;
    }, time);
    serverEmit('attack');
 }
 function slideHerou(){
    allow = true;
    let time = 0;
    if(player.body.onFloor())
    {
        time = 350;
        player.animations.play('slide');
    }
    setTimeout(function(){
        allow = false;
    }, time);
 }
 function attackHeroy()
 {
    allow = true;
    let time = 0;
    
    if(!player.body.onFloor())
    {
        time = 700;
        player.animations.play('jump_attack');
    }
    else 
    {
        time = 350;
        player.animations.play('attack');
    }
    socket.emit('sword', time);
    setTimeout(function(){
        allow = false;
    }, time);
    serverEmit('attack');
    for (let i = 0; i < enemies.length; i++) { 
        if (checkOverlap(player, enemies[i].player))
        {
            socket.emit('attack', {
                id: enemies[i].id
            });
        }
    }
    for (let i = 0; i < bots.length; i++) { 
        if (checkOverlap(player, bots[i].player))
        {
            socket.emit('attack_bot', {
                id: bots[i].id
            });
        }
    }
}
function setCollisionAttack()
{
    for (let i = 0; i < enemies.length; i++) { 
        game.physics.arcade.collide(enemies[i].player , weapon.bullets, collision_handler, null, this);
        game.physics.arcade.collide(player , enemies[i].weapon.bullets, collision_handler, null, this);
        if (checkOverlap(weapon.bullets, enemies[i].player))
        {
            socket.emit('attack', {
                id: enemies[i].id
            });
        }
    }
    
    for (let i = 0; i < bots.length; i++) { 
        game.physics.arcade.collide(bots[i].player , weapon.bullets, collision_handler, null, this);
        if (checkOverlap(weapon.bullets, bots[i].player))
        {         
            socket.emit('attack_bot', {
                id: bots[i].id
            });  
        }
    }
}
function enemyBullet(id)
{
    const enemy = findplayerbyid(id);
    enemy.weapon.trackSprite(enemy.player, 0, 0, true);
    if(enemy.player.scale.x === -1)
    {
        enemy.weapon.fireAtXY(0, enemy.player.position.y);
    }
    else enemy.weapon.fire();
}
function myBullet(id)
{
    if(player.scale.x === -1)
    {
        weapon.fireAtXY(0, player.position.y);
    }
    else weapon.fire();
}
function mySword(id)
{

}
function enemySword(data)
{
    const enemy = findplayerbyid(data.id);
    enemy.weapon.trackSprite(enemy.player, 0, 0, true);
    if(!enemy.player.body.onFloor())
    {
        enemy.player.animations.play('jump_attack');
    }
    else 
    {
        enemy.player.animations.play('attack');
    }
    setTimeout(function(){
        enemy.player.animations.play('stay');
    }, data.time);
}
function collision_handler (object1, object2) {
    object2.kill();
}
 function attackBot(bots)
 {
    bots.attack = true;
    setTimeout(function(){
        
        bots.attack = false;
    }, 350);
    bots.player.animations.play('attack');
    socket.emit('cross_bot', {
        id_bot: bots.id, 
        bot_x: bots.player.position.x, 
        bot_y: bots.player.position.y, 
        player_x: player.position.x, 
        player_y: player.position.y,
    });
}
function onPause()
{
    game.paused = true;
    document.getElementsByClassName('menu_pause')[0].style = 'display:block';

    document.getElementsByClassName('back_menu')[0].addEventListener('click', ()=>{
        onPlay();
        game.state.start('menu', false, false);
    });
    document.getElementsByClassName('play')[0].addEventListener('click', onPlay);
}
function onPlay()
{
    game.paused = false;
    document.getElementsByClassName('menu_pause')[0].style = 'display:none';
}
function onFullScreen()
{
    if (game.scale.isFullScreen)
    {
        game.scale.stopFullScreen();
    }
    else
    {
        game.scale.startFullScreen(false);
    }
}