const { createDir } = require("./cli-helpers");
require('dotenv').config({ path: '../.env' });
const apiPath = "../server/api";

const resourceFolders = [
  "controller", "dao", "model", "routes"
];

const baseDir = `${apiPath}/${process.argv[2]}`;
const created = createDir(`${apiPath}/${process.argv[2]}`);
if (created) {
  resourceFolders.forEach((f) => {
    createDir(`${baseDir}/${f}`);
  });
}
console.log("Creating api resources for: " + process.argv[2]);
