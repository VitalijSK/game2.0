const fs = require('fs');

module.exports.main = async (req, res, next)=>{
    res.writeHead(200, {'Content-Type': 'text/html'});
    const myReadStream = fs.createReadStream('../client/index.html', 'utf8');
    myReadStream.pipe(res);
}
module.exports.css = async (req, res, next)=>{
    res.writeHead(200, {'Content-Type': 'text/css'});
    const myReadStream = fs.createReadStream('../client/css/style.css', 'utf8');
    myReadStream.pipe(res);
}
module.exports.jquery = async (req, res, next)=>{
    res.writeHead(200, {'Content-Type': 'text/js'});
    const myReadStream = fs.createReadStream('../client/lib/jquery-3.3.1.min.js', 'utf8');
    myReadStream.pipe(res);
}
module.exports.mainJs = async (req, res, next)=>{
    res.writeHead(200, {'Content-Type': 'text/js'});
    const myReadStream = fs.createReadStream('../client/js/main.js', 'utf8');
    myReadStream.pipe(res);
}
