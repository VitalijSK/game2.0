const formRegistr = document.getElementById('formRegistr');
const formAuth = document.getElementById('formAuth');
const section = document.getElementsByTagName('section')[0];
const main = document.getElementsByTagName('main')[0];
const btnLiveCollection = main.getElementsByTagName('button');
const btnArr = Array.from(btnLiveCollection);
//style//
btnArr.forEach(function(btn){
    btn.addEventListener('mouseover', function(event){
        section.style = 'background-color:rgba(0, 0, 0, 0.52);';
    });
    btn.addEventListener('mouseout', function(event){
        section.style = 'background-color:rgba(0, 0, 0, 0);';
    });
});
document.getElementById('singup').addEventListener('click', function(){
    document.getElementById('auth').style="lefT: 100vw;opacity:1;";
    document.getElementById('registr').style="lefT: calc( 50vw - 200px );opacity:1;";
    section.classList.add('formmod');
});
document.getElementById('singin').addEventListener('click', function(){
    document.getElementById('registr').style="lefT: -400px;opacity:1;";
    document.getElementById('auth').style="right: calc( 50vw - 200px );opacity:1;";
    section.classList.add('formmod');
});
//--end style//
// requery to server //
formRegistr.addEventListener('submit', function(event){
    event.preventDefault();
    const login = formRegistr.elements['name'].value;
    const password = formRegistr.elements['password'].value;
    $.ajax({
        type: 'POST',
        url: '/api/signup',
        data: {'login': login, 'password': password},
        cache: false,           
        success: function(response){
            messageUser('You was registration');
        },
        statusCode: {
            400: function() {
                messageUser( "Such a user already exists" );
            }
        }
    });
});
 
formAuth.addEventListener('submit', function(event){
    event.preventDefault();
    const login = formAuth.elements['name'].value;
    const password = formAuth.elements['password'].value;
    $.ajax({
        type: 'POST',
        url: '/api/signin',
        data: {'login': login, 'password': password},
        cache: false,           
        success: function(res){
            messageUser('all good');
            document.cookie = `token=${res}`;
            update();
        },
        statusCode: {
            400: function() {
                messageUser( "You wrong" );
            }
        }
    });
});

function update(){
    const token = get_cookie('token');
    $.ajax({
        type: 'POST',
        url: '/api/game',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("authorization", token);
          },
        cache: false,           
        success: function(res){
            messageUser('you enter');
            console.log(res);
            const {login} = res;
            startGame(login);
        },
        statusCode: {
            400: function() {
                messageUser( "Forbidden!" );
            }
        }
    });
}
//end requery///

function messageUser(message)
{
    alert(message);
}  
function get_cookie ( cookie_name )
{
  const results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}

window.onload = ()=>{
    update();
}
    function startGame(login){
        document.getElementsByClassName('main')[0].hidden = true;
        document.getElementById('registr').hidden = true;
        document.getElementById('auth').hidden = true;
        //document.getElementsByTagName('body')[0].style = 'background-color:rgba(0, 0, 0, 0.52);';
        document.getElementById('game').hidden = false;
        document.getElementsByClassName('fon')[0].style = 'display:block; opacity:1';
        const socket = io.connect();
        let canvas_width, canvas_height;
        if(document.body.clientWidth < 750)
        {
            canvas_width = document.body.clientWidth;
            canvas_height =document.body.clientHeight;
        }
        else{
            canvas_width = 800;
            canvas_height =600;
        }
       
        
        const game = new Phaser.Game(canvas_width,canvas_height, Phaser.CANVAS, 'gameDiv');
        game.state.disableVisibilityChange = true;
        
        const boot = new Boot(game);
        const preload = new Preload(game);
        const menu = new Menu(game);
        const shop = new Shop(game);
        const top = new Top(game);
        const level1 = new Level1(game);
        const level2 = new Level2(game);
        const level3 = new Level3(game);
        const gameover = new GameOver(game);
        const gameBootstrapper = {
            init: function(gameContainerElementId){
                game.state.add('boot', boot);
                game.state.add('preload', preload);
                game.state.add('menu', menu);
                game.state.add('shop', shop);
                game.state.add('top', top);
                game.state.add('level1', level1);
                game.state.add('level2', level2);
                game.state.add('level3', level3);
                game.state.add('gameover', gameover);
                game.state.start('boot'); 
            }
        };
        gameBootstrapper.init("gameDiv");
}



