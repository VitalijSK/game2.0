class Top{
    constructor(gam)
    {
        this.game = gam;
    }
    create()
    {
        document.getElementsByClassName('top_list')[0].style = 'display:block';
        getTop(setListTop);
        document.getElementsByClassName('back_menu_top')[0].addEventListener('click', ()=>{
            document.getElementsByClassName('top_list')[0].style = 'display:none';
            game.state.start('menu', false, false);
        });
    }
    
}

