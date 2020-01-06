const clear = require("clear");
const figlet = require("figlet");
const chalk = require("chalk");
const log = require("./logger");

const cliHeader = () => {
  // clean the console
  clear();
  // some unnecessary but nice ascii art
  log.info(
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
