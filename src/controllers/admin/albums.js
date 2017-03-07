const express = require('express');
const models = require('../../models/index').models;
const async = require('async');

const config = require('config').get('owncloud');

const fs = require('fs');
const path = require('path');

function list(req, res, next) {
  const directories = _listDirectories();
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

      res.send({albums, availableAlbums: directories});
    });
  });
}

function processCreate(req, res, next) {
  const opts = {
    title: req.body.title,
    internalName: req.body.internalName,
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

    res.send(album);
  });
}

function processEdit(req, res, next) {
  _findAlbum(req.params.album_id).then(album => {
    const opts = {
      title: req.body.title || album.title || 'Default title',
      internalName: req.body.internalName || album.internalName,
      summary: req.body.summary
    };

    album.set(opts);
    album.save((err, album) => {
      if (err) {
        return next({
          status: 500,
          error: err
        });
      }

      res.send(album);
    });
  }).catch(err => {
    return next({
      status: 500,
      error: err
    });
  });
}

function get(req, res, next) {
  _findAlbum(req.params.album_id).then(album => {
    res.send(album);
  }).catch(err => {
    return next({
      status: 500,
      error: err
    });
  });
}

function removeAlbum(req, res, next) {
  models.Album.findByIdAndRemove(req.params.album_id, (err, album) => {
    if (err) {
      return next({
        status: 500,
        error: err
      });
    }

    res.send({success: true, album_id: req.params.album_id});
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

function _listDirectories() {
  const directories = fs.readdirSync(config.path).filter(file => {
    console.info(file);
    return fs.statSync(path.join(config.path, file)).isDirectory() && !file.startsWith('.');
  });

  return directories;
}


module.exports = {
  list,
  get,
  processCreate,
  processEdit,
  removeAlbum
};
