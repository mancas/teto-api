const express = require('express');
const config = require('config');

const bodyParser  = require('body-parser');

const passport = require('passport');
const PassportManager = require('./sessions/PassportManager');

const models = require('./models/index').models;

const auth = require('./routes/auth');
const authController = require('./controllers/auth');

const admin = require('./routes/v1/admin');

const app = express();
app.set('port', config.server.port || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

PassportManager.configure(passport);

// Routes
app.use('/', auth);
app.use('/v1/admin',
  passport.authenticate('jwt', { session: false}),
  authController.authenticationMiddleware,
  admin);

module.exports = app;
