
require("dotenv").config({ path: "../.env" });
const { createDir, createFile } = require("../cli-helpers");

const apiPath = "../server/api";

function createFoldersAndFiles(name) {
  const resourceFolders = [
    "controller", "dao", "model", "routes", "tests"
  ];

  const baseDir = `${apiPath}/${name}`;

  console.log(`Creating api resources for: ${name}`);

  createDir(`${baseDir}`);
  console.log(`created new folder ${baseDir}`);

  resourceFolders.forEach((f) => {
    const resourceSubDir = `${baseDir}/${f}`;
    createDir(resourceSubDir);
    createFile(`${resourceSubDir}/${name}-${f}.js`);
  });
}

module.exports = {
  createFoldersAndFiles
};
