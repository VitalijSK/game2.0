const cookieParser = require('cookie-parser');
const session = require('express-session');

const MSSQLStore = require('connect-mssql')(session);
const mssql = require('mssql');

module.exports = {
    createStore: function(){
        const config = {
            user: 'test',
            password: '12345',
            server: 'localhost',
            database: 'testdb',
            port: 1433,
            pool:{
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            }
        }
        return new MSSQLStore(config);
    } 
};