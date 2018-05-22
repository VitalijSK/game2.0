class GameOver{
    constructor(gam)
    {
        const game = gam;
    }
    create()
    {
        document.getElementsByClassName('gameover')[0].style = 'display:block';
        
        document.getElementsByClassName('back_menu')[1].addEventListener('click', ()=>{
            document.getElementsByClassName('gameover')[0].style = 'display:none';
            game.state.start('menu', false, false);
        });
    }
}