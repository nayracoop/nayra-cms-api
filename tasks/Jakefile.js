// Jakefile
const migrator = require("./migrator");

const done = (err) => {
  if (err) {
    console.error(err);
  }
  process.exit();
};

desc("runs migrations in this same folder");

task("migrate", () => {
  migrator.up(done);
});
