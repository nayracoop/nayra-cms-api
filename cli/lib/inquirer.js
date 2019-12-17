const inquirer = require("inquirer");
const files = require("./files");

module.exports = {
  askNayraCMS: () => {
    const questions = [
      {
        name: "app-name",
        type: "input",
        message: "Enter a name of your project",
        validate: value => {
          if (value) {
            return true;
          } else {
            return "Please don't forget to enter your app name, gracia!"
          }
        }
      },
      {
        name: "sample-choice",
        type: "list",
        message: "How many SSDs bought Tobaias this year?",
        choices: ["1", "2","3", "4", "He doesn't like SSDs"]

      }
    ];

    return inquirer.prompt(questions);
  }
};