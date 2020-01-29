
require("dotenv").config({ path: "../.env" });
const log = require("./logger");
const { createDir, createFile } = require("./files");

const apiPath = "../server/api";


function createFoldersAndFiles(name) {
  const resourceFolders = [
    "controller", "dao", "model", "routes", "tests"
  ];

  const baseDir = `${apiPath}/${name}`;

  log.info(`Creating api resources for: ${name}`);

  createDir(`${baseDir}`);
  log.info(`created new folder ${baseDir}`);

  resourceFolders.forEach((f) => {
    const resourceSubDir = `${baseDir}/${f}`;
    createDir(resourceSubDir);
    createFile(`${resourceSubDir}/${name}-${f}.js`);
  });
}


module.exports = {
  createFoldersAndFiles
};
