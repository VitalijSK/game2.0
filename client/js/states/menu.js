class Menu{
    constructor(gam)
    {
        this.game = gam;
    }
    create()
    {
        getUser(getSkin);
        document.getElementsByClassName('menu')[0].style = 'display:block';
        const self = this;
        document.getElementsByClassName('level1')[0].addEventListener('click', ()=>{
            document.getElementsByClassName('menu')[0].style = 'display:none';
            self.game.state.start('level1', false, false);
        });
        document.getElementsByClassName('level2')[0].addEventListener('click', ()=>{
            document.getElementsByClassName('menu')[0].style = 'display:none';
            self.game.state.start('level2', false, false);
        });
        document.getElementsByClassName('level3')[0].addEventListener('click', ()=>{
            document.getElementsByClassName('menu')[0].style = 'display:none';
            self.game.state.start('level3', false, false);
        });
        document.getElementsByClassName('shop')[0].addEventListener('click', ()=>{
            document.getElementsByClassName('menu')[0].style = 'display:none';
            self.game.state.start('shop', false, false);
        });
    }
}