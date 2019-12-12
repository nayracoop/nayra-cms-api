const path = require("path");

exports.getVersion = () => {
  return __filename.replace(path.join(__dirname, '/'), '');
}

exports.up = async (db, cb) => {
  cb(null, true);
}
