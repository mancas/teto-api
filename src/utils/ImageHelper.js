const sharp = require('sharp');
const sizeOf = require('image-size');

module.exports = {
  generateThumbnail: function(image) {
    return sharp(image)
      .resize(320, 240)
      .toFile('/tmp/output.jpg', (err, info) => {
        console.info(err, info);
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
