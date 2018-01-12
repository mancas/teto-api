const express = require('express');
const models = require('../../models/index').models;
const async = require('async');

const config = require('config').get('owncloud');

const fs = require('fs');
const path = require('path');

const uuidV4 = require('uuid/v4');

const ImageHelper = require('../../utils/ImageHelper');

function setMainPhoto(req, res, next) {
  const photoId = req.body.photoId;
  const albumId = req.body.albumId;
  if (!photoId || !albumId) {
    return next({
      status: 500,
      error: 'Photo ID not found on request body'
    });
  }

  models.Photo.getPhotosFromAlbum(albumId, false).then(photos => {
    async.each(photos, (photo, cb) => {
      photo.set({
        main: photo._id === photoId
      });
      photo.save((err, photo) => {
        if (err) {
          return cb(err);
        }

        console.info(photo);
        cb()
      });
    }, err => {
      if (err) {
        console.info(err);
        return next({
          status: 500,
          error: err
        });
      }

      models.Album.findWithPhotos(albumId, (err, album) => {
        if (err) {
          console.info(err);
          return next({
            status: 500,
            error: err
          });
        }

        res.send({album});
      });
    });
  });
}

module.exports = {
  setMainPhoto
};
