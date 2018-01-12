'use strict';

let model;

module.exports = (mongoose, name) => {
  const schema = mongoose.Schema({
    title: {
      type: String,
      required: true
    },

    // Folder name
    internalName: {
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

      mongoose.model('Photo').getPhotosFromAlbum(id).then(photos => {
        cb(null, Object.assign({}, album._doc, {photos}));
      }).catch(err => {
        console.error(err);
        return cb(err);
      });
    });
  };

  // TODO: add statics methods

  model = mongoose.model(name, schema);

  return model;
};
