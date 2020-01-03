const clear = require("clear");
const figlet = require("figlet");
const chalk = require("chalk");

const cliHeader = () => {
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
};

module.exports = { cliHeader };
