const _ = require("lodash");
const assert = require("assert");
const moment = require("moment");
const crypto = require("crypto");
const mongoose = require("mongoose");

const { BaseDao } = require("../../_base/dao/base-dao");
const { UserSchema } = require("../model/user-model");

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
     * Create user (overrides base method)
     */

    this.theSchema.statics.createNew = async function createNew(thing, { _id: userId, accountId }) {
      assert(thing.password, "Created user must have a password");

      const Model = mongoose.model("User", UserSchema);
      const newUser = new Model(thing);

      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.pbkdf2Sync(thing.password, salt, 1000, 64, "sha512").toString("hex");
    
      newUser.salt = salt;
      newUser.hash = hash;

      newUser.createdAt = moment().format();
      newUser.createdBy = userId;
      newUser.accountId = accountId;
      const newThing = await newUser.save();
      return newThing;
    };


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
     * Email confirmation
     */
    this.theSchema.statics.confirmEmail = async function confirmEmail(_id) {
      const update = { emailConfirmed: true };
      const userUpdated = await this.model(theModelName).findByIdAndUpdate(
        _id, update, { new: true },
      );
      return userUpdated;
    };

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
