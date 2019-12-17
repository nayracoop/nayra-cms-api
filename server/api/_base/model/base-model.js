const mongoose = require("mongoose");

const updatedSubSchema = mongoose.Schema({
  _id: false,
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User", immutable: true },
  at: { type: Date, immutable: true }
});
const baseSchema = {
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", immutable: true },
  createdAt: { type: Date, immutable: true },
  updated: [updatedSubSchema],
  deleted: { type: Boolean },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt: { type: Date }
};

module.exports = {
  BaseSchema: baseSchema
};
