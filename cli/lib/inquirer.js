const inquirer = require("inquirer");
const chalk = require("chalk");
const files = require("./files");


module.exports = {
  askNayraCMS: () => {
    const questions = [
      {
        name: "app-name",
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
        message: "Enter username"
      },
      {
        name: "password",
        type: "password",
        message: "Enter password",
        mask: "*"
      },
      {
        name: "password-confirmation",
        type: "password",
        message: "Confirm password",
        mask: "*"
      },
      {
        name: "user-types",
        type: "checkbox",
        message: "Select user types needed",
        choices: ["guest", "consultant"]
      }
    ];
    return inquirer.prompt(questions);
  }
};
