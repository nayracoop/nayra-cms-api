const inquirer = require("inquirer");
const chalk = require("chalk");

module.exports = {
  askNayraCMS: () => {
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
        message: "Enter username",
        validate: (value) => {
          if (value.length > 4) {
            return true;
          }
          return "Please provide a username of at least 5 characters";
        }
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
          { value: "editor", name: " Editor - access restricted data, can edit, login", short: "Consultant" }
        ]
      }
    ];
    return inquirer.prompt(questions);
  }
};
