const { createDir, createFile } = require("./cli-helpers");
require('dotenv').config({ path: '../.env' });
const apiPath = "../server/api";

const resourceFolders = [
  "controller", "dao", "model", "routes"
];

const baseDir = `${apiPath}/${process.argv[2]}`;

createDir(`${apiPath}/${process.argv[2]}`);
resourceFolders.forEach((f) => {
  let resourceSubDir = `${baseDir}/${f}`;
  createDir(resourceSubDir);
  createFile(`${resourceSubDir}/${process.argv[2]}-${f}.js`);
});

console.log("Creating api resources for: " + process.argv[2]);
