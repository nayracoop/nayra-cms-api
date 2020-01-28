/* eslint-disable no-param-reassign */
const mongoose = require("mongoose");
const { BaseSchema } = require("../../_base/model/base-model");

const AccountSchema = mongoose.Schema({
  name: {
    type: String, trim: true, required: true, index: true
  },
  privateKey: {
    type: String, trim: true, required: true, index: true
  },
  isValid: { type: Boolean, required: true, default: true },
  isSuperAdmin: { type: Boolean, required: true, default: false },
  ...BaseSchema
}, {
  collection: "accounts",
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
    },
    virtuals: true
  }
});

AccountSchema.virtual("url").get(function url() { return `/accounts/${this._id}`; });

module.exports = {
  AccountSchema
};
