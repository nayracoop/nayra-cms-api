/* eslint-disable no-use-before-define */
const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const moment = require("moment");

class BaseDao {
  constructor(theSchema, theModelName) {
    this.theSchema = theSchema;
    this.theModelName = theModelName;

    /**
     * Create
     */
    this.theSchema.statics.createNew = async function createNew(thing, creator) {
      const Model = this.getModel();
      const something = new Model(thing);
      if (creator) {
        const { _id: userId, accountId } = creator;
        something.createdBy = userId;
        something.accountId = accountId;
      }
      something.createdAt = moment().format();
      const newThing = await something.save();
      return newThing;
    }.bind(this);

    this.theSchema.statics.getAll = async function getAll({
      skip,
      limit,
      select,
      sort,
      query
    }, { accountId }) {
      const thingsCount = await this.model(theModelName).countDocuments({ deleted: false, accountId });
      const things = await this.model(theModelName).find({
        ...query, accountId
      }).skip(skip)
        .limit(limit)
        .select(select)
        .sort(sort);
      return {
        count: thingsCount,
        list: things
      };
    };

    this.theSchema.statics.getById = async function getById(_id, { accountId }) {
      const thing = await this.model(theModelName).findOne({ _id, accountId });
      return thing;
    };

    /**
     * Update
     */
    this.theSchema.statics.updateById = async function updateById(_id, thing,
      { _id: userId, accountId }) {
      const update = Object.assign({},
        { $push: { updated: { by: userId, at: moment().format() } } }, thing);
      const opts = { new: true, runValidators: true };
      const thingUpdated = await this.model(theModelName).findOneAndUpdate({
        _id, accountId
      }, update, opts);
      return thingUpdated;
    };

    this.theSchema.statics.removeById = async function removeById(_id, { _id: userId, accountId }) {
      const deleteResults = await this.model(theModelName).delete({ _id, accountId },
        userId);
      return deleteResults;
    };

    this.theSchema.plugin(mongooseDelete,
      {
        deletedAt: true, deletedBy: true, overrideMethods: true, indexFields: ["deleted"]
      });

    this.getModel = this.getModel.bind(this);
  }

  getModel() {
    return mongoose.model(this.theModelName, this.theSchema);
  }
}

module.exports = {
  BaseDao
};
