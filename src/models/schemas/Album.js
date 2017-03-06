'use strict';

let model;

module.exports = (mongoose, name) => {
  const schema = mongoose.Schema({
    title: {
      type: String,
      required: true
    },

    summary: String,

    c_at: {
      type: Date,
      default: new Date()
    },

    u_at: {
      type: Date
    }
  });

  schema.statics.findWithPhotos = function(id, cb) {
    this.findOne({_id: id}, (err, album) => {
      if (err) {
        console.error(err);
        return cb(err);
      }

      mongoose.model('Photo').find({album_id: id}, (err, photos) => {
        if (err) {
          console.error(err);
          return cb(err);
        }

        album.photos = photos;
        cb(null, album);
      })
    });
  };

  // TODO: add statics methods

  model = mongoose.model(name, schema);

  return model;
};
