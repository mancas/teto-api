'use strict';

const ImageHelper = require('../../utils/ImageHelper');
const config = require('config').get('images');
const path = require('path');
const async = require('async');

let model;

module.exports = (mongoose, name) => {
  const SchemaTypes = mongoose.Schema.Types;

  const schema = mongoose.Schema({
    title: {
      type: String,
      required: false
    },

    filename: {
      type: String,
      required: true
    },

    main: {
      type: Boolean,
      default: false
    },

    album_id: {
      ref: 'Album',
      type: SchemaTypes.ObjectId
    },

    c_at: {
      type: Date,
      default: new Date()
    },

    u_at: {
      type: Date
    }
  });

  // TODO: add statics methods

  schema.statics.getPhotosFromAlbum = function (album_id, withDimensions = true) {
    return new Promise((resolve, reject) => {
      this.find({ album_id: album_id }, (err, photos) => {
        if (err) {
          console.error('Error while trying to query photos from album', err);
          return reject(err);
        }

        if (!withDimensions) {
          return resolve(photos);
        }

        const images = [];
        async.each(photos, (photo, cb) => {
          ImageHelper.sizeOf(path.join(config.path, photo.album_id.toString(), `${photo.filename}.jpg`)).then(dimensions => {
            images.push(Object.assign({}, photo._doc, dimensions));
            cb();
          }).catch(err => cb(err))
        }, err => {
          if (err) {
            console.info(err);
            return reject(err);
          }

          resolve(images);
        });
      });
    });
  };

  model = mongoose.model(name, schema);

  return model;
};
