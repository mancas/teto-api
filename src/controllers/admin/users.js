const express = require('express');
const models = require('../../models/index').models;

function list(req, res, next) {
  models.User.find({}, (err, users) => {
    if (err) {
      return next(err);
    }

    res.render('admin/pages/users/list', { users });
  });
}

function get(req, res, next) {
  _findUser(req.params.user_id).then(user => {
    res.send(user);
  }).catch(err => {
    next({
      status: 500,
      error: err
    });
  });
}

function processCreate(req, res, next) {
  const password = req.body.password;
  const password_repeated = req.body.password_repeat;

  if (password !== password_repeated) {
    return res.render('admin/pages/users/form', {
      message: 'Password do not match',
      error: true
    });
  }

  const opts = {
    name: req.body.username,
    password: password,
    role: req.body.role,
    sex: req.body.sex
  };

  models.User.signup(opts, (err, user) => {
    if (err) {
      return next({
        status: 500,
        error: err
      });
    }

    res.send(user);
  });
}

function processEdit(req, res, next) {
  _findUser(req.params.user_id).then(user => {
    const password = req.body.password;
    const password_repeated = req.body.password_repeat;

    const opts = {
      role: req.body.role,
      sex: req.body.sex
    };

    if (password && password_repeated) {
      opts.password = password;
    }

    user.set(opts);
    user.save((err, user) => {
      if (err) {
        return next({
          status: 500,
          error: err
        });
      }

      res.send(user);
    });
  }).catch(err => {
    next({
      status: 500,
      error: err
    });
  });
}

function removeUser(req, res, next) {
  models.User.findByIdAndRemove(req.params.user_id, (err, user) => {
    if (err) {
      console.error(err);
      next({
        status: 500,
        error: err
      });
      return;
    }

    res.send({success: true, user_id: req.params.user_id});
  });
}

function _findUser(id) {
  return new Promise((resolve, reject) => {
    models.User.findOne({ _id: id }, (err, user) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(user);
    });
  });
}

module.exports = {
  list,
  get,
  processCreate,
  processEdit,
  removeUser
};
