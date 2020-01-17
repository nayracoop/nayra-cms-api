
// migration for ../tasks/migrations/1576078044600_add-superuser.js
const path = require("path");
const crypto = require("crypto");

exports.getVersion = () => {
  return __filename.replace(path.join(__dirname, "/"), "");
}

exports.up = (db, cb) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync("123456", salt, 1000, 64, "sha512").toString("hex");

  const user = {
    firstName: "Super",
    lastName: "Admin",
    username: "admin",
    email: "admin@nayra.coop",
    hash,
    salt,
    emailConfirmed: true
  };

  // user or users
  db.collection("users").insertOne(user, (err) => {
    if (err) {
      console.error(err);
      cb(err, false);
    }

    cb(null, true);
  });
};
