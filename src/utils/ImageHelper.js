const sharp = require('sharp');
const sizeOf = require('image-size');

const config = require('config').get('images');

const path = require('path');
const fs = require('fs');

const MAX_THUMBNAIL_WIDTH = 320;
const MAX_THUMBNAIL_HEIGHT = 240;

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

module.exports = {
  generateThumbnail: function(image, album, output) {
    return new Promise((resolve, reject) => {
      console.info(image);
      console.info(typeof album);
      console.info(output);
      this.sizeOf(image).then(dimensions => {
        let width, thumbnailWidth;
        let height, thumbnailHeight;
        const folderPath = path.join(config.path, album);
        // The output path should be: /<config-path>/<album_id>/<output>.jpg
        const outputPath = path.join(folderPath, `${output}.jpg`);
        const outputThumbnailPath = path.join(folderPath, `${output}-thumbnail.jpg`);
        console.info(outputPath);

        if (!fs.existsSync(folderPath)){
          fs.mkdirSync(folderPath);
        }

        if (dimensions.width > dimensions.height) {
          width = MAX_WIDTH;
          thumbnailWidth = MAX_THUMBNAIL_WIDTH;
          height = null;
          thumbnailHeight = null;
        } else {
          width = null;
          thumbnailWidth = null;
          height = MAX_HEIGHT;
          thumbnailHeight = MAX_THUMBNAIL_HEIGHT;
        }

        const promises = [];

        // Original resized
        promises.push(sharp(image)
          .resize(width, height)
          .toFile(outputPath, (err, info) => {
            console.info(err, info);
          }));

        // Thumbnail
        promises.push(sharp(image)
          .resize(thumbnailWidth, thumbnailHeight)
          .toFile(outputThumbnailPath, (err, info) => {
            console.info(err, info);
          }));

        Promise.all(promises).then(() => {
          resolve();
        }).catch(reject);
      }).catch(reject);
    });
  },

  sizeOf: function(image) {
    return new Promise((resolve, reject) => {
      sizeOf(image, (err, dimensions) => {
        if (err) {
          return reject(err);
        }

        resolve(dimensions);
      })
    });
  }
};
