const inquirer = require("inquirer");
const chalk = require("chalk");
const boxen = require("boxen");
const { createSuperAdminMigration } = require("../utils/migration");
const log = require("../utils/logger");


function askInitialQuestions() {
  const questions = [
    {
      name: "appName",
      type: "input",
      message: `Enter a ${chalk.keyword("orange")("name")} of your project`,
      validate: (value) => {
        if (value) {
          return true;
        }
        return "Please don't forget to enter your app name, gracia!";
      }
    },
    {
      name: "username",
      type: "input",
      message: "Enter username (alphanumeric and dashes, no spaces, 5-20 characters)",
      validate: (value) => {
        const match = value.match(/^(?=.{5,20}$)[0-9a-zA-Z_-]+$/);
        return (match) ? true : "Please provide a valid username (alphanumeric and dashes, no spaces, 5-20 characters)";
      }
    },
    {
      name: "email",
      type: "input",
      message: "Enter email"
    },
    {
      name: "password",
      type: "password",
      message: "Enter password",
      mask: "*",
      validate: (value) => {
        if (value.length > 5) {
          return true;
        }
        return "Please provide a password of at least 6 characters";
      }
    },
    {
      name: "userTypes",
      type: "checkbox",
      message: "Select user types needed",
      choices: [
        { value: "guest", name: " Guest - access restricted data, can't edit, no login", short: "Guest" },
        { value: "editor", name: " Editor - access restricted data, can edit, login", short: "Editor" }
      ]
    }
  ];
  return inquirer.prompt(questions);
}

const initializeCms = async () => {
  const initData = await askInitialQuestions();
  const { username, email, password } = initData;
  createSuperAdminMigration({ username, email, password });
  log.info(boxen(`The cms ${chalk.keyword("darkorange")(initData.appName)} has been created! \n`
  + "Please run \"npm run migrations\" to create user and account and then"
  + ` login using username ${chalk.keyword("darkorange")(initData.username)} and password. \n`
  + "\nUse --help to see all cli commands",
  { padding: 1 }));
};

module.exports = {
  initializeCms
};
