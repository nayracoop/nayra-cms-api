/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { BaseSchema } = require('../../base-schema');

const AppVersionSchema = mongoose.Schema({
  version: {
    type: String, trim: true, required: true, index: true,
  },
  updateUri: { type: String, trim: true, required: true },
  ...BaseSchema,
}, {
  collection: 'appVersion',
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
    },
    virtuals: true,
  },
});

AppVersionSchema.virtual('url').get(function url() { return `/appVersions/${this._id}`; });

module.exports = {
  AppVersionSchema,
};
