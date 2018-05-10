
class Boot{
    constructor(gam)
    {
        this.game = gam;
    }
    create()
    {
        const self = this;
        document.getElementsByClassName('fon')[0].addEventListener('click', ()=>{
            document.getElementsByClassName('fon')[0].style = 'display:none';   
            self.game.state.start('preload', false, false);
        });
    }
}