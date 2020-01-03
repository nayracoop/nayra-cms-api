const fs = require("fs");
const path = require("path");

const createDir = (dirPath) => {
  let created = false;
  fs.mkdirSync(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.error("There was an error: ", err);
      throw err;
    } else {
      console.log("Done! new dir created");
      created = true;
    }
  });

  return created;
};

const createFile = (_path, content) => {
  fs.writeFileSync(_path, content, (err) => {
    if (err) {
      console.error("There was an error: ", err);
      throw err;
    } else {
      console.log("Done! new file created");
    }
  });
};

const getCurrentDirectoryBase = () => {
  return path.basename(process.cwd());
};

const directoryExists = (filePath) => {
  return fs.existsSync(filePath);
};

module.exports = {
  getCurrentDirectoryBase,
  directoryExists,
  createDir,
  createFile
};
