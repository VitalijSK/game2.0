class Remote_player{
    constructor(game, id, startx, starty, skin) {
        this.x = startx;
        this.y = starty;
        this.id = id;
        this.weapon = game.add.weapon(20, 'bullet');
        this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon.bulletSpeed = 600;
        this.weapon.fireRate = 100;
        this.player = eval(skin);
        this.player.position.x = startx; 
        this.player.position.y = starty; 
        return this;
     }
}