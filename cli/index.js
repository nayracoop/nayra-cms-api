const { cliHeader } = require("./lib/header");
const { program } = require("./commands/commands");

cliHeader();

program.parse(process.argv);
