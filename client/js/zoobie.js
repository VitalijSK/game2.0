class Zoobies{
    constructor(game,id, startx, starty){
        this.x = startx;
        this.y = starty;
        this.id = id;
        this.prevX = this.x;
        this.player = game.add.sprite(42, 51, 'zoombie');
        game.physics.arcade.enable(this.player);
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
     
        this.player.body.bounce.y = 0.2;
        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(20, 32, 5, 16);
        this.player.body.gravity.y = 300;
        this.player.body.velocity.x = 50;
     
        this.player.position.x = startx; 
        this.player.position.y = starty; 
        //  Our two animations, walking left and right.
        this.player.animations.add('run', [23,24,25,26,27,28,29,30,31,32], 10, true);
        this.player.animations.add('attack', [0,1,2,3,4,5,6,7], 40, false);
        this.player.animations.add('stay', [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22], 10, true);
        return this;
    }
    
}