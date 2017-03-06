const loggerConfig = require("config").get("logger");

module.exports = {
  error: function(msg) {
    console.error(loggerConfig.prefix + msg);
  },

  info: function(msg) {
    console.info(loggerConfig.prefix + msg);
  },

  log: function(msg) {
    console.log(loggerConfig.prefix + msg);
  }
};
