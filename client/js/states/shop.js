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
    }
    
}

