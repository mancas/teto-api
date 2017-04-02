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
    res.json({success: true, token: 'JWT ' + token, user: JSON.stringify(user)});
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
  _findUserById(decodedToken._id).then(user => {
    if (!user) {
      return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
    }

    req.user = user;
    next();
  }).catch(err => {
    throw err;
  });
}

function isAuthenticated(req, res, next) {
  const token = _getToken(req.headers);
  if (!token) {
    return res.status(401).send({isAuthenticated: false});
  }

  const decodedToken = jwt.decode(token, config.secret);
  _findUserById(decodedToken._id).then(user => {
    if (!user) {
      return res.status(401).send({isAuthenticated: false});
    }

    res.send({isAuthenticated: true, user});
  }).catch(err => {
    // LOG error
    res.status(500).send({isAuthenticated: false, err: err.message});
  });
}

function _findUserById(id) {
  return new Promise((resolve, reject) => {
    User.findOne({
      _id: id
    }, (err, user) => {
      if (err) {
        reject(err);
        return;
      }

      if (!user) {
        resolve(null);
        return;
      }

      resolve(user);
    });
  });
}

function signup(req, res, next) {
  console.error(req.body);
  User.signup({
    name: req.body.name,
    password: req.body.password
  }, (err, user) => {
    if (err) {
      console.error('Error creating user', err);
      return next({
        status: 500,
        error: err
      });
    }

    res.send(user);
  });
}

module.exports = {
  authenticate,
  authenticationMiddleware,
  isAuthenticated,
  signup
};
