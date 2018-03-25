const formRegistr = document.getElementById('formRegistr');
const formAuth = document.getElementById('formAuth');
const game = document.getElementById('game');
const main = document.getElementsByTagName('main')[0];

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
            alert('You was registration');
            //main.getElementById('registr').hidden = true;
        },
        statusCode: {
            400: function() {
            alert( "Such a user already exists" );
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
            alert('all good');
            console.log(res);
            document.cookie = `token=${res}`;
        },
        statusCode: {
            400: function() {
            alert( "You wrong" );
            }
        }
    });
});
game.getElementsByTagName('button')[0].addEventListener('click', function(event){
    update();
});
function update(){
    const token = get_cookie('token');
    console.log(token);
    $.ajax({
        type: 'POST',
        url: '/api/game',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("authorization", token);
          },
        cache: false,           
        success: function(res){
            alert('you enter');
            const {login} = res;
            startGame(login);
        },
        statusCode: {
            400: function() {
            alert( "Forbidden!" );
            }
        }
    });
}
window.onload = ()=>{
    startGame();
}
function startGame(login){
    const game = document.getElementById('fieldGame');
    game.innerHTML = 'You PLAY RIGHT NOW!!!!</br>';
    game.innerHTML += 'You nickname '+ login;
}
function get_cookie ( cookie_name )
{
  const results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}

