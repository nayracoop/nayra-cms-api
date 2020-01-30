const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const log = require("./logger");

require("dotenv").config({ path: "../.env" });

const timestamp = Date.now();

function basicMigration() {
  const destinationFileName = `../${process.env.MIGRATIONS_FOLDER}/${timestamp}_${process.argv[2]}.js`;
  const template = `
  //migration for ${destinationFileName}
    const path = require("path");
  
  exports.getVersion = () => {
    return __filename.replace(path.join(__dirname, '/'), '');
  }
  
  exports.up = async (db, cb) => {
    cb(null, true);
  }
  `;
  fs.writeFile(destinationFileName, template, (err, file) => {
    if (err) throw err;
    log.info(`Created migration template ${destinationFileName}`);
  });
}


function createSuperAdminMigration({ username, email, password }) {
  const templateFileName = path.join(__dirname, "..", "templates", "migration.template.js.ejs");
  const workingDirectory = process.cwd();
  const destinationFileName = path.join(workingDirectory, `tasks/migrations/${timestamp}_create_super_admin_user.js`);

  const template = fs.readFileSync(templateFileName, "utf8");

  const contents = ejs.render(template, {
    cliPassword: password,
    cliUsername: username,
    cliEmail: email
  });

  fs.writeFileSync(destinationFileName, contents, (err, file) => {
    if (err) throw err;
    log.info(`Created superadmin migration ${destinationFileName}`);
  });
}


module.exports = ({
  basicMigration,
  createSuperAdminMigration
});
