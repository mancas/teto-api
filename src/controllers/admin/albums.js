const express = require('express');
const models = require('../../models/index').models;
const async = require('async');

const config = require('config').get('owncloud');

const fs = require('fs');
const path = require('path');

const uuidV4 = require('uuid/v4');

const ImageHelper = require('../../utils/ImageHelper');

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

      albums.forEach(album => {
        const idx = directories.indexOf(album.internalName);
        if (idx !== -1) {
          directories.splice(idx, 1);
        }
      });

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

    let images = _listImages(opts.internalName);

    // TODO: create thumbnails and add watermark && create images on bd

    async.each(images, (image, cb) => {
      _createImage(image, opts.internalName, album._id, cb);
    }, err => {
      if (err) {
        // TODO rollback
        return next({
          status: 500,
          error: err
        });
      }

      res.send({status: 'ok'});
    });
  });
}

function _createImage(image, folder, album, cb) {
  const filename = uuidV4();
  const opts = {
    title: '',
    album_id: album,
    filename
  };

  const folderPath = path.join(config.path, folder);

  models.Photo.create(opts, (err, photo) => {
    if (err) {
      console.error(error);
      return cb(error);
    }

    console.info(photo);

    console.info(path.join(folderPath, image));
    ImageHelper.generateThumbnail(path.join(folderPath, image), album.toString(), filename).then(() => {
      cb();
    }).catch(error => {
      console.info(error);
      cb(error);
    });
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

function _listImages(folder) {
  const folderPath = path.join(config.path, folder);

  let images = fs.readdirSync(folderPath).filter(file => {
    console.info(file);
    const stat = fs.statSync(path.join(folderPath, file));
    return !stat.isDirectory() && !file.startsWith('.') && file.indexOf('jpg') !== -1;
  });

  return images;
}

function listImagesFromFolder(req, res, next) {
  const {folder} = req.body;

  if (!folder) {
    return next({
      status: 500,
      error: {
        message: 'No folder specified'
      }
    });
  }

  let files = _listImages(folder);
  const images = [];

  async.each(files, (file, cb) => {
    ImageHelper.sizeOf(path.join(config.path, folder, file)).then(dimensions => {
      images.push(Object.assign({}, {
        image: file.replace(/\.[^/.]+$/, "")
      }, dimensions));
      cb();
    }).catch(err => cb(err))
  }, err => {
    if (err) {
      console.info(err);
      return next({
        status: 500,
        error: {
          message: 'Size of error'
        }
      });
    }

    res.send({images});
  });
}

function getImageFromFolder(req, res, next) {
  const {folder, image_name} = req.params;

  if (!folder || !image_name) {
    return next({
      status: 500,
      error: {
        message: 'No folder or image specified'
      }
    });
  }

  const folderPath = path.join(config.path, folder);
  const imageWithExtension = fs.readdirSync(folderPath).find(file => {
    return file.includes(image_name);
  });
  const imagePath = path.join(folderPath, imageWithExtension);

  if (!fs.existsSync(folderPath) || !imageWithExtension) {
    // Do something
    return next({
      status: 500,
      error: {
        message: 'Image or folder does not exits'
      }
    });
  }

  res.sendFile(imagePath);
}

module.exports = {
  list,
  get,
  processCreate,
  processEdit,
  removeAlbum,
  listImagesFromFolder,
  getImageFromFolder
};
