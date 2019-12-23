const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const commander = require("commander");

const inquirer = require("./lib/inquirer");
const { addUser } = require("./lib/add-user");
const { createFoldersAndFiles } = require("./lib/add-user");
//

const program = new commander.Command();

// clean the console
clear();
// some unnecessary but nice ascii art
console.log(
  chalk.yellow(
    figlet.textSync("Nayra CLI", { horizontalLayout: "full" })
  )
);

// version 
const version = program.version("Nayra CMS CLI v0.0.0", "-v");
console.log(version.version());

// actions
const run = async () => {
  const appQuestions = await inquirer.askNayraCMS();
  console.log(appQuestions);
};

const init = () => {
  console.log("I'll do the (super)admin migration and the ");
  addUser();
};


// options list
program
  .command("init")
  .description("handle the CMS installation and basic configuration")
  .action(init)
;

program
  .command("add-resource <name>")
  .description("creates a new API REST resource")
  .action((name) => {
    if (name) {
      console.log("new ", name);
      createFoldersAndFiles();
    } else {
      console.info("no resource name provided");
    }
      
  })
;

program.parse(process.argv);
// run();
