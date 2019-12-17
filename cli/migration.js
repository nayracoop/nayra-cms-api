const fs = require("fs");
require("dotenv").config({ path: "../.env" });

const timestamp = Date.now();
const fileName = `../${process.env.MIGRATIONS_FOLDER}/${timestamp}_${process.argv[2]}.js`;
const template = `
//migration for ${fileName}
  const path = require("path");

exports.getVersion = () => {
  return __filename.replace(path.join(__dirname, '/'), '');
}

exports.up = async (db, cb) => {
  cb(null, true);
}
`;
fs.writeFile(fileName, template, (err, file) => {
  if (err) throw err;
  console.log(`Created migration template ${fileName}`);
});
