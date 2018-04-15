const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bluebird = require('bluebird');
const config = require('./config/index');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const errorHandler = require('./middlewares/errorHandler');
var p2 = require('p2'); 
var physicsPlayer = require('./server/physics/playermovement.js');


const port = process.env.PORT || config.port;
http.listen(port, err =>{
  if(err) throw err;
  console.log(`Server listenin on port ${port}`);
});


app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret
}));
app.use(express.static(path.join('./client')));
require('./routes/main')(app);
require('./routes/route')(app);
require('./routes/user')(app);

app.use(errorHandler);
