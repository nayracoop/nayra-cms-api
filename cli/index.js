const clear = require("clear");
const figlet = require("figlet");
const chalk = require("chalk");
const { program } = require("./commands/commands");

// clean the console
clear();
// some unnecessary but nice ascii art
console.log(
  chalk.yellow(
    figlet.textSync("Nayra CLI", { horizontalLayout: "full" })
  )
);

program.parse(process.argv);
// run();