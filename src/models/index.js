'use strict';

const path = require('path');
const config = require('config');
const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

mongoose.set('debug', true);

// DeprecationWarning: Mongoose: mpromise (mongoose's default promise library)
// is deprecated, plug in your own promise library instead:
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

const _ = require('underscore');

const models = require('require-all')({
  dirname: path.join(__dirname, 'schemas'),
  excludeDirs: /^helpers$/
});

const dbConfig = config.get('db');

const db = {};

const mongoURI = (function () {
  let rv = 'mongodb://';
  // Hosts
  if (Array.isArray(dbConfig.hosts)) {
    rv += dbConfig.hosts.join(',');
  } else {
    rv += [dbConfig.hosts].join(',');
  }

  rv += `/${dbConfig.name}`;

  return rv;
})();

mongoose.connect(mongoURI);
const conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

db.conn = conn;
db.mongoose = mongoose;
db.models = {};

_.each(models, (model, key) => {
  db.models[key] = model(mongoose, key);
  if (!db.models[key]) {
    return
  }
  db.models[key].on('index', (err) => {
    console.error(err)
  })
});

module.exports = db;
