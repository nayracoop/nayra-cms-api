
//migration for ../tasks/migrations/1576078044600_add-superuser.js
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");

exports.getVersion = () => {
  return __filename.replace(path.join(__dirname, '/'), '');
}

exports.up = async (db, cb) => {
  const timestamp = Date.now();
  const pass = crypto.createHash("md5").update("12341234").digest("hex");


  const User = mongoose.model('User', UserSchema);

  const user = {
    // firstName: "Super",
    // lastName: "Admin",
    // username: "admin",
    // email: "admin@nayra.coop"
    // password: pass,
    // createdAt: timestamp,
    // updatedAt: timestamp
  };

  // user or users
  // db.collection("users").insertOne(user, (err) => {
  //   if (err) {
  //     console.error(err);
  //   }
  // });
  cb(null, true);
};
