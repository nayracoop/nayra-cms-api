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
        message: "Enter username (alphanumeric and dashes, no spaces, 5-20 characters)",
        validate: (value) => {
          const match = value.match(/^(?=.{5,20}$)[0-9a-zA-Z_-]+$/);
          return (match) ? true : "Please provide a valid username (alphanumeric and dashes, no spaces, 5-20 characters)";
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
          { value: "editor", name: " Editor - access restricted data, can edit, login", short: "Editor" }
        ]
      }
    ];
    return inquirer.prompt(questions);
  }
};
