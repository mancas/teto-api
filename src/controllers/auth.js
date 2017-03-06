'use strict';

const express = require('express');

const jwt = require('jwt-simple');

const models = require('../models').models;
const User = models.User;

const config = require('config').get('db');

function authenticate(req, res) {
  User.exists(req.body.username, req.body.password, (err, user) => {
    if (err) {
      return res.status(500).send({error: 'Error while trying to recover user'});
    }

    if (!user) {
      return res.send({success: false, msg: 'Authentication failed. User not found.'});
    }

    const token = jwt.encode(user, config.secret);
    // return the information including token as JSON
    res.json({success: true, token: 'JWT ' + token});
  });
}

function _getToken(headers) {
  if (headers && headers.authorization) {
    // JWT token
    let split = headers.authorization.split(' ');
    if (split.length !== 2) {
      return null;
    }

    return split[1];
  } else {
    return null;
  }
}

function authenticationMiddleware(req, res, next) {
  const token = _getToken(req.headers);
  if (!token) {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

  const decodedToken = jwt.decode(token, config.secret);
  User.findOne({
    _id: decodedToken._id
  }, (err, user) => {
    if (err) {
      throw err;
    }

    if (!user) {
      return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
    }

    req.user = user;
    next();
  });
}

module.exports = {
  authenticate,
  authenticationMiddleware
};
