const fs = require("fs");

const createDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.error("There was an error: ", err);
      throw err;
    } else {
      console.log("Done! new dir created");
      return true;
    }
  });
};

module.exports = {
  createDir
};
