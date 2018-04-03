const main = require('../controllers/main');

module.exports = function (app) {
    app.get('/', main.main);
};
