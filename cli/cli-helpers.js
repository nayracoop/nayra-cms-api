const fs = require("fs");

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

const createFile = (path, content) => {
  fs.writeFileSync(path, content, (err) => {
    if (err) {
      console.error("There was an error: ", err);
      throw err;
    } else {
      console.log("Done! new file created");
      created = true;
    }
  });
};

module.exports = {
  createDir,
  createFile
};
