class Shop{
    constructor(gam)
    {
        this.game = gam;
    }
    create()
    {
        document.getElementsByClassName('shop_menu')[0].style = 'display:block';
        getUser(getCoins);
        setCollection();
        document.getElementsByClassName('back_menu_shop')[0].addEventListener('click', ()=>{
            document.getElementsByClassName('shop_menu')[0].style = 'display:none';
            game.state.start('menu', false, false);
        });
    }
    
}

