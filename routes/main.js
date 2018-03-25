const main = require('../controllers/main');

module.exports = function (app) {
    app.get('/', main.main);
    app.get('/client/css/style.css', main.css);
    app.get('/client/lib/jquery-3.3.1.min.js', main.jquery);
    app.get('/client/js/main.js', main.mainJs);
};
