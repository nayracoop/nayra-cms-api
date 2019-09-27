/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { BaseSchema } = require('../../_base/model/base-model');

const CurrencySchema = mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Account', immutable: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
    index: true,
  },
  symbol: { type: String, trim: true, required: true },
  ...BaseSchema,
}, {
  collection: 'currency',
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
    },
    virtuals: true,
  },
});

CurrencySchema.virtual('url').get(function url() { return `/currencies/${this._id}`; });

module.exports = {
  CurrencySchema,
};
