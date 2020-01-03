const clear = require("clear");
const figlet = require("figlet");
const chalk = require("chalk");
const { program } = require("./commands/commands");

// clean the console
clear();
// some unnecessary but nice ascii art
console.log(
  chalk.keyword("darkorange")(
    figlet.textSync(
      "nayra cli",
      {
        horizontalLayout: "full",
        font: "Roman"
      }
    )
  )
);

program.parse(process.argv);
