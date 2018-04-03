const fs = require('fs');

module.exports.main = async (req, res, next)=>{
    res.writeHead(200, {'Content-Type': 'text/html'});
    const myReadStream = fs.createReadStream('../client/index.html', 'utf8');
    myReadStream.pipe(res);
}

