const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const commander = require("commander");
const { cliHeader } = require("../lib/header");
const init = require("./init");
const { addUser } = require("./add-user");
const ResourceHelper = require("../lib/resourceHelpers");

const program = new commander.Command();

// version
program.version("nayra cms cli v0.0.0");

// actions
const initQuestions = async () => {
  const appQuestions = await init.askNayraCMS();
  console.log(appQuestions);
};

const userInit = () => {
  console.log("I'll do the (super)admin migration and the ");
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
      console.error("ERROR: `add-resource` command requires to be provided a resource name");
    }
  });

module.exports = {
  program
};
