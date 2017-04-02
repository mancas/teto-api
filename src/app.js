const express = require('express');
const config = require('config');

const path = require('path');

const owncloud = config.get('owncloud');

const bodyParser  = require('body-parser');

const passport = require('passport');
const PassportManager = require('./sessions/PassportManager');

const models = require('./models/index').models;

const auth = require('./routes/auth');
const authController = require('./controllers/auth');

const admin = require('./routes/v1/admin');

const app = express();
app.set('port', config.server.port || 3000);

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.end();
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

PassportManager.configure(passport);

// Routes
app.use('/', auth);
app.use('/admin',
  passport.authenticate('jwt', { session: false}),
  authController.authenticationMiddleware,
  admin);
app.use('/static',
  passport.authenticate('jwt', { session: false}),
  authController.authenticationMiddleware,
  express.static(path.join(__dirname, owncloud.path)));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({error: err.message});
});

module.exports = app;
