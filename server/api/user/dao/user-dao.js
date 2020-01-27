const _ = require("lodash");
const assert = require("assert");
const moment = require("moment");
const crypto = require("crypto");

const { BaseDao } = require("../../_base/dao/base-dao");

class UserDao extends BaseDao {
  constructor(theSchema, theModelName) {
    super(theSchema, theModelName);

    // /**
    //  * Read (by apikey)
    //  */
    // this.theSchema.statics.getByApiKey = async function getByApiKey(apiKey) {
    //   assert(_.isString(apiKey), new TypeError("ApiKey is not a valid string."));

    //   const user = await this.model(theModelName).findOne({ apiKey });
    //   return user;
    // };

    /**
     * Read (by username)
     */
    this.theSchema.statics.getByUsernameOrEmail = async function getByUsernameOrEmail(nameOrEmail) {
      assert(_.isString(nameOrEmail), new TypeError("Username is not a valid string."));

      const user = await this.model(theModelName).findOne({
        $or: [{ username: nameOrEmail }, { email: nameOrEmail }]
      });
      return user;
    };

    /**
     * Email confirmation : not in use for now
     */
    // this.theSchema.statics.confirmEmail = async function confirmEmail(_id) {
    //   const update = { emailConfirmed: true };
    //   const userUpdated = await this.model(theModelName).findByIdAndUpdate(
    //     _id, update, { new: true },
    //   );
    //   return userUpdated;
    // };

    this.theSchema.methods.setPassword = function setPassword(password) {
      this.salt = crypto.randomBytes(16).toString("hex");
      this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
    };

    this.theSchema.methods.validPassword = function validPassword(password) {
      const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
      return this.hash === hash;
    };

    this.theSchema.methods.newFailedLoginAttempt = async function newFailedLoginAttempt(password) {
      const update = {
        $push:
        { failedLoginAttempts: { failedPassword: password, onDate: moment().format() } }
      };
      await this.updateOne(update);
    };
  }
}

module.exports = { UserDao };
