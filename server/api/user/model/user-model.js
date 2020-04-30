/* eslint-disable no-param-reassign */
const mongoose = require("mongoose");
const { BaseSchema } = require("../../_base/model/base-model");

const UserSchema = mongoose.Schema({
  // apiKey: {
  //   type: String, trim: true, required: true, index: true
  // },
  accountId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Account" },
  username: {
    type: String, trim: true, required: true, index: { unique: true }
  },
  email: {
    type: String, trim: true, required: true, index: { unique: true }
  },
  emailConfirmed: {
    type: Boolean, trim: true, default: false
  },
  firstName: {
    type: String, trim: true
  },
  lastName: {
    type: String, trim: true
  },
  hash: {
    type: String, trim: true, notForQuery: true
  },
  salt: {
    type: String, trim: true, notForQuery: true
  },
  previousHashes: [{ type: String, trim: true }],
  failedLoginAttempts: [{ failedPassword: String, onDate: Date }],
  ...BaseSchema
}, {
  strict: "throw",
  collection: "users",
  // hide sensible data and include virtuals
  toJSON: {
    transform(doc, ret) {
      delete ret.salt;
      delete ret.hash;
      delete ret.failedLoginAttempts;
      delete ret.previousHashes;
      delete ret.deleted;
      delete ret.deletedAt;
      //
      return ret;
    },
    virtuals: true
  }
});

const UserValidationSchema = {
  username: {
    in: ["body"],
    optional: true,
    errorMessage: "Username must be a string",
    isString: true
  },
  password: {
    in: ["body"],
    isString: true,
    errorMessage: "Password must be a string",
    optional: true
  },
  email: {
    in: ["body"],
    isEmail: true,
    optional: true,
    errorMessage: "Email is wrong"
  },
  emailConfirmed: {
    isBoolean: true,
    toBoolean: true,
    optional: true,
    errorMessage: "emailConfirmed must be a boolean"
  },
  firstName: {
    isString: true,
    errorMessage: "firstName must be a string",
    optional: true
  },
  lastName: {
    isString: true,
    errorMessage: "lastName must be a string",
    optional: true
  }
};

UserSchema.virtual("url").get(function url() { return `/api/users/${this._id}`; });

module.exports = {
  UserSchema,
  UserValidationSchema
};
