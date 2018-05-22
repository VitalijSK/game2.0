const UserController = require('../controllers/user');
const ShopController = require('../controllers/shop');
const checkToken = require('../middlewares/checktoken');

module.exports = function (app) {
    app.post('/api/game', checkToken, UserController.getCurrentUser);
    app.post('/api/getUser', checkToken, UserController.getCurrentUser);
    app.post('/api/getTop', checkToken, UserController.getTop);
    app.post('/api/buy', checkToken, ShopController.buy);
    app.post('/api/collections', checkToken, ShopController.collection);
};