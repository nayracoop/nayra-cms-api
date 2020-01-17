
// migration for ../tasks/migrations/1576078044600_add-superuser.js
const path = require("path");
const crypto = require("crypto");

exports.getVersion = () => {
  return __filename.replace(path.join(__dirname, "/"), "");
};

exports.up = async (db, cb) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync("123456", salt, 1000, 64, "sha512").toString("hex");

  const account = {
    name: "Nayra CMS",
    privateKey: crypto.randomBytes(48).toString("hex"),
    isSuperAdmin: true

  };

  const user = {
    firstName: "Super",
    lastName: "Admin",
    username: "admin",
    email: "admin@nayra.coop",
    hash,
    salt,
    emailConfirmed: true
  };

  db.collection("accounts").insertOne(account, (err) => {
    if (err) {
      console.error(err);
      cb(err, false);
    }

    console.log(`Created the account ${account.name}`);
    user.accountId = account._id;
    // user or users
    db.collection("users").insertOne(user, (_err) => {
      if (_err) {
        console.error(_err);
        cb(_err, false);
      }
      console.log(`Created the base user ${user.username}`);
      console.log(`Associating ${user.username} to the account ${account.name}`);
      cb(null, true);
    });
  });
};
