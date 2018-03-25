const UserController = require('../controllers/user');
const checkToken = require('../middlewares/checktoken');

module.exports = function (app) {
    app.post('/api/game', checkToken, UserController.getCurrentUser);
};