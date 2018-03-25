const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bluebird = require('bluebird');
const config = require('../config/index');
const app = express();
const errorHandler = require('../middlewares/errorHandler');

mongoose.Promise = bluebird;
mongoose.connect(config.database, err =>{
  if(err)
  {
    throw err;
  }
  console.log('Mongo connected');
})

app.listen(config.port, err =>{
  if(err) throw err;
  console.log(`Server listenin on port ${config.port}`);
});

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret
}));

require('../routes/route')(app);

app.use(errorHandler);
