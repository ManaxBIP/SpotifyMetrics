var createError = require('http-errors');
const cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var axios = require('axios')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const CLIENT_ID = '5fb2c7aaa6644c7fb487926dc9ab8c19';
const REDIRECT_URI = 'localhost:3000/callback'; // Replace this with your actual server URL

app.get('/spotify/authorize', async (req, res) => {
  try {
    // Construisez l'URL d'autorisation de Spotify
    const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user-read-private`;

    // Renvoie l'URL d'autorisation à la partie frontend (client) pour ouvrir la page de connexion Spotify
    res.json({ authorization_url: AUTH_URL });
  } catch (error) {
    console.error('The request failed with the message:', error.message);
    res.status(500).send('Authorization request failed');
  }
});



app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

