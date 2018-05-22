class Level1{
    constructor(gam)
    {
        this.game = gam;
        game = this.game;
    }
    create () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        bots = [];
        this.game.stage.backgroundColor = '#000000';
    
        bg = this.game.add.tileSprite(0, 0, canvas_width, canvas_height, 'background_level1');
        bg.fixedToCamera = true;
    
        map = this.game.add.tilemap('level1');
    
        map.addTilesetImage('tiles-2');
    
        map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);
    
        layer = map.createLayer('Tile Layer 1');
    
        //  Un-comment this on to see the collision tiles
        // layer.debug = true;
    
        layer.resizeWorld();
        
        console.log("client started");
        //socket.on("connect", onsocketConnected); 
        if(socket.connect)
        {
            onsocketConnected(1);
        }
		//listen to new enemy connections
		//socket.on("new_enemyPlayer", onNewPlayer);
		socket.on("new_Bot", onNewBot);
		//listen to enemy movement 
		//socket.on("enemy_move", onEnemyMove);
		//when received remove_player, remove the player passed; 
		//socket.on('remove_player', onRemovePlayer); 
		socket.on('remove_bot', onRemoveBot); 
		//when the player receives the new input
        socket.on('input_recieved', onInputRecieved);
        socket.on('killed', onKilled);
       		// check for item removal
		socket.on ('itemremove', onitemremove); 
		// check for item update
		socket.on('item_update', onNewBot); 
		socket.on('myBullet', myBullet); 
		socket.on('mySword', mySword);  
		socket.on('enemyBullet', enemyBullet); 
		socket.on('enemySword', enemySword); 
        cursors = this.game.input.keyboard.createCursorKeys();
        const attack = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        const pause = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        const fullscreen = this.game.input.keyboard.addKey(Phaser.Keyboard.F12);
        const shoot = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
        const slide = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
        attack.onDown.add(attackHeroy, this);
        pause.onDown.add(onPause, this);
        fullscreen.onDown.add(onFullScreen, this);
        shoot.onDown.add(shootHerou, this);
        slide.onDown.add(slideHerou, this);
        this.game.input.keyboard.removeKeyCapture(this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR));
        this.game.input.keyboard.removeKeyCapture(this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT));
        this.game.input.keyboard.removeKeyCapture(this.game.input.keyboard.addKey(Phaser.Keyboard.F12));
        this.game.input.keyboard.removeKeyCapture(this.game.input.keyboard.addKey(Phaser.Keyboard.X));
        this.game.input.keyboard.removeKeyCapture(this.game.input.keyboard.addKey(Phaser.Keyboard.Z));

        /*this.text = game.add.text(player.position.x, player.position.y-30, "lvl 0", {
            font: "13px Arial",
            fill: "#ff0044",
            align: "center"
        });
    
        this.text.anchor.setTo(0.5, 0.5);*/
        //  Creates 30 bullets, using the 'bullet' graphic
        weapon = this.game.add.weapon(20, 'bullet');
        //  The bullet will be automatically killed when it leaves the world bounds
        weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

        //  The speed at which the bullet is fired
        weapon.bulletSpeed = 600;

        //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
        weapon.fireRate = 100;
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
     }
     
     update() {
        const hitPlatform = this.game.physics.arcade.collide(player, layer);
        player.body.collideWorldBounds = true; 
        for (let i = 0; i < bots.length; i++) {
            this.game.physics.arcade.collide(bots[i].player, layer);
            bots[i].player.body.collideWorldBounds = true; 
            walkBot(bots[i]);
            if (checkOverlap(player, bots[i].player))
            {
               attackBot(bots[i]);
            }
        }
        setCollisionAttack();

        for (let i = 0; i < enemies.length; i++) {
            this.game.physics.arcade.collide(enemies[i].player, layer);  
        }
        player.body.velocity.x = 0;
        if (cursors.left.isDown)
        {
            serverEmit('left');
            player.scale.x = -1; 
            player.anchor.setTo(0.5);
            player.animations.play('run');
            
        }
        else if (cursors.right.isDown)
        {
            serverEmit('right');
            player.scale.x = 1; 
            player.anchor.setTo(0.5);
            player.animations.play('run');
        }
        else if (cursors.up.isDown && player.body.onFloor() && hitPlatform)
        {
            serverEmit('jump');
        }
        else if(allow)
        {

        }
        else
        {
            serverEmit('stop');
            player.animations.play('stay');
        }
        this.game.input.enabled = true;
    }
 }