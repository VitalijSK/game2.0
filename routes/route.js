const AuthController = require('../controllers/auth');

module.exports = function (app) {
    app.post('/api/signup', AuthController.signup);
    app.post('/api/signin', AuthController.signin);
};
