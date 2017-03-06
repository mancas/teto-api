'use strict';

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/').models.User;
const config = require('config').get('db');
let passport;

const opts = {
  secretOrKey: config.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeader()
};

module.exports = {
  configure: function(pass) {
    passport = pass;
    this.configurePassport();
  },

  configurePassport: function() {
    passport.use(new JwtStrategy(opts, User.authenticate));
  }
};
