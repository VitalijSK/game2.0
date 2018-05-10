class Knight{
    constructor(game){
        const player = game.add.sprite(42, 51, 'knight');
    
        game.physics.enable(player, Phaser.Physics.ARCADE);
     
        player.body.bounce.y = 0.2;
        player.body.collideWorldBounds = true;
        player.body.setSize(20, 32, 5, 16);
        player.body.gravity.y = 300;
     
        //  Our two animations, walking left and right.
         player.animations.add('run', [40,41,42,43,44,45,46,47,48,49], 10, true);
         player.animations.add('jump_attack', [30,31,32,33,34,35,36,37,38,39], 20, false);
         player.animations.add('attack', [0,1,2,3,4,5,6,7,8,9], 40, false);
         player.animations.add('stay', [10,11,12,13,14,15,16,17,18,19], 10, true);
         return player;
    }
    
}