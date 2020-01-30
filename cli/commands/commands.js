const commander = require("commander");
const log = require("../utils/logger");
const { cliHeader } = require("../utils/header");
const { initializeCms } = require("./init");
const ResourceHelper = require("./resourceHelpers");

const program = new commander.Command();

// version
program.version("nayra cms cli v0.0.0");


// actions list
program
  .command("init")
  .description("handle the CMS installation and basic configuration")
  .action(() => {
    cliHeader();
    initializeCms();
  });

program
  .command("add-resource")
  .description("creates a new API REST resource")
  .action(() => {
    ResourceHelper.addNewResource();
  });

module.exports = {
  program
};
