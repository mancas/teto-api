'use strict';

let model;

module.exports = (mongoose, name) => {
  const SchemaTypes = mongoose.Schema.Types;

  const schema = mongoose.Schema({
    title: String,

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

  model = mongoose.model(name, schema);

  return model;
};
