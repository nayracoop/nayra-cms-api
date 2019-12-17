const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require("./lib/inquirer");

clear();

console.log(
  chalk.yellow(
    figlet.textSync('Nayra CLI', { horizontalLayout: 'full' })
  )
);

const run = async () => {
  const appQuestions = await inquirer.askNayraCMS();
  console.log(appQuestions);
};

run();
