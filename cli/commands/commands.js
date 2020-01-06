const commander = require("commander");
const chalk = require("chalk");
const log = require("../lib/logger");
const { cliHeader } = require("../lib/header");
const init = require("./init");
const { addUser } = require("./add-user");
const ResourceHelper = require("../lib/resourceHelpers");

const program = new commander.Command();

// version
program.version("nayra cms cli v0.0.0");

// actions
const initQuestions = async () => {
  const initData = await init.askNayraCMS();
  log.info("");
  log.info("-----------------------------------------------------------");
  log.info(`The cms ${chalk.keyword("darkorange")(initData.appName)} has been created!`);
  log.info(`Please login using username  ${chalk.yellow(initData.username)} and password.`);
  log.info("");
  log.info("Use --help to see all cli commands");
};

const userInit = () => {
  log.info("I'll do the (super)admin migration and the ");
  addUser();
};


// options list
program
  .command("init")
  .description("handle the CMS installation and basic configuration")
  .action(() => {
    cliHeader();
    initQuestions();
  });

program
  .command("add-resource [name]")
  .description("creates a new API REST resource")
  .action((name) => {
    if (name) {
      ResourceHelper.createFoldersAndFiles(name);
    } else {
      log.error("ERROR: `add-resource` command requires to be provided a resource name");
    }
  });

module.exports = {
  program
};
