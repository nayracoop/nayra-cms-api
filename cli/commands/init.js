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
          if (value.length > 5) {
            return true;
          }
          return "Please provide a username of at least 5 characters";
        }
      },
      {
        name: "password",
        type: "password",
        message: "Enter password",
        mask: "*"
      },
      {
        name: "passwordConfirmation",
        type: "password",
        message: "Confirm password",
        mask: "*"
      },
      {
        name: "userTypes",
        type: "checkbox",
        message: "Select user types needed",
        choices: [
          { value: "guest", name: " Guest - access restricted data, no login", short: "Guest" },
          { value: "consultant", name: " Consultant - access restricted data, login", short: "Consultant" }
        ]
      }
    ];
    return inquirer.prompt(questions);
  }
};
