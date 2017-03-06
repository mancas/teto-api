const express = require('express');
const models = require('../../models/index').models;
const async = require('async');

function list(req, res, next) {
  models.Album.find({}, (err, albums) => {
    if (err) {
      return next(err);
    }

    async.each(albums, (album, cb) => {
      models.Photo.find({ album_id: album._id }, (err, photos) => {
        if (err) {
          return cb(err);
        }
        album.photos = photos.length;
        cb();
      });
    }, (err) => {
      if (err) {
        console.error(err);
        return next({
          status: 500,
          error: err
        });
      }

      res.send(albums);
    });
  });
}

function create(req, res, next) {
  res.render('admin/pages/albums/form');
}

function processCreate(req, res, next) {
  const opts = {
    title: req.body.title,
    summary: req.body.summary
  };

  models.Album.create(opts, (err, album) => {
    if (err) {
      console.error(err);
      return next({
        status: 500,
        error: err
      });
    }

    res.redirect(`/admin/albums/edit/${album._id}`);
  });
}

function edit(req, res, next) {
  _findAlbum(req.params.album_id).then(album => {
    res.render('admin/pages/albums/form', {
      album,
      edition: true
    });
  }).catch(err => {
    console.error(err);
    return next({
      status: 500,
      error: err
    });
  });
}

function processEdit(req, res, next) {
  _findUser(req.params.user_id).then(user => {
    const password = req.body.password;
    const password_repeated = req.body.password_repeat;

    const opts = {
      name: req.body.username,
      role: req.body.role,
      sex: req.body.sex
    };

    if (password && password_repeated) {
      opts.password = password;
    }

    user.set(opts);
    user.save((err, user) => {
      if (err) {
        console.error(err);
        return next({
          status: 500,
          error: err
        });
      }

      res.redirect('/admin/albums/');
    });
  }).catch(err => {
    console.error(err);
    return next({
      status: 500,
      error: err
    });
  });
}

function _findAlbum(id) {
  return new Promise((resolve, reject) => {
    models.Album.findWithPhotos(id, (err, album) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(album);
    });
  });
}

module.exports = {
  list,
  create,
  processCreate,
  edit,
  processEdit
};
