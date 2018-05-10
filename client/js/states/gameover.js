class GameOver{
    constructor(gam)
    {
        const game = gam;
    }
    create()
    {
        LoadingText = game.add.text(game.world.width / 2, game.world.height / 2, "GameOver", {
            font: '32px "Press Start 2P"',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        LoadingText.anchor.setTo(0.5, 0.5);
    }
}