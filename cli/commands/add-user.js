const log = require("../lib/logger");

const addUser = () => {
  // check if exist a super user first
  log.info("creating new (super)admin");
};

module.exports = {
  addUser
};
