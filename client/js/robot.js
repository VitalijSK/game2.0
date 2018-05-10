class Robot{
    constructor(game){

        const player = game.add.sprite(52, 51, 'robot');
        game.physics.enable(player, Phaser.Physics.ARCADE);
     
        player.body.bounce.y = 0.2;
        player.body.collideWorldBounds = true;
        player.body.setSize(20, 32, 5, 16);
        player.body.gravity.y = 300;
     
        //  Our two animations, walking left and right.
        player.animations.add('stay', [0,1,2,3,4,5,6,7,8,9], 10, true);
        player.animations.add('jump', [10,11,12,13,14,15,16,17,18,19], 10, true);
        player.animations.add('jump_attack', [20,21,22,23,24,25,26,27], 10, true);
        player.animations.add('jump_shoot', [28,29,30,31,32], 10, true);
        player.animations.add('attack', [33,34,35,36,37,38,39,40,41,42], 10, true);
        player.animations.add('run', [43,44,45,46,47,48,49,50], 10, true);
        player.animations.add('run_shoot', [51,52,53,54,55,56,57,58], 10, true);
        player.animations.add('shot', [59,60,61,62], 10, false);
        player.animations.add('slide', [63,64,65,66,67,68,69,70,71,72], 10, true);
        return player;
    }
    
}