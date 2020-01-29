const commander = require("commander");
const chalk = require("chalk");
const boxen = require("boxen");
const { exec } = require("child_process");
const log = require("../lib/logger");
const { cliHeader } = require("../lib/header");
const init = require("./init");
const { addUser } = require("./add-user");
const { superAdminMigration } = require("../migration");
const ResourceHelper = require("../lib/resourceHelpers");

const program = new commander.Command();

// version
program.version("nayra cms cli v0.0.0");

// actions
const initQuestions = async () => {
  const initData = await init.askNayraCMS();
  try {
    superAdminMigration({ username: initData.username, email: initData.email, password: initData.password });
    log.info(boxen(`The cms ${chalk.keyword("darkorange")(initData.appName)} has been created! \n`
    + "Please run \"npm run migrations\" to create user and account and then"
    + ` login using username ${chalk.keyword("darkorange")(initData.username)} and password. \n`
    + "\nUse --help to see all cli commands",
    { padding: 1 }));
  } catch (err) {
    log.error(err);
  }
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
