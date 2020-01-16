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
  hash: { type: String, trim: true },
  salt: { type: String, trim: true },
  previousHashes: [{ type: String, trim: true }],
  failedLoginAttempts: [{ failedPassword: String, onDate: Date }],
  ...BaseSchema
}, {
  collection: "users",
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
    },
    virtuals: true
  }
});

UserSchema.virtual("url").get(function url() { return `/users/${this._id}`; });

module.exports = {
  UserSchema
};
