class Preload{  
    constructor(gam)
    {
        this.game = gam;
    }
    preload() {
        this.game.load.tilemap('level2', '/assets/mapsprites/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('level3', '/assets/mapsprites/level3.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.tilemap('level1', '/assets/mapsprites/level2.json', null, Phaser.Tilemap.TILED_JSON);

        this.game.load.image('background_level1', '/assets/background/background1.png');
        this.game.load.image('background_level2', '/assets/background/background2.png');
        this.game.load.image('background_level3', '/assets/background/background3.png');


        this.game.load.spritesheet('knight', 'assets/persons/knight.png', 42,51);
        this.game.load.spritesheet('robot', 'assets/persons/robot.png', 52,51);
        this.game.load.spritesheet('ninja', 'assets/persons/ninja.png', 38,51);
        this.game.load.spritesheet('zoombie', 'assets/persons/zoombie.png', 42,51);

        this.game.load.spritesheet('bullet', 'assets/bullet.png', 20,16);

        this.game.load.image('tiles-1', '/assets/tiles-1.png');
        this.game.load.image('tiles-2', '/assets/tiles-2.png');
 
     }
    create()
    {
        const LoadingText = this.game.add.text(this.game.world.width / 2, this.game.world.height / 2, "LOADING_GAME...", {
            font: '32px "Press Start 2P"',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        LoadingText.anchor.setTo(0.5, 0.5);
        this.game.state.start('menu', false, false);
    }
}