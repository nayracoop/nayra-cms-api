const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { ObjectId } = mongoose.Types;
const { normalizeAndLogError, ValidationError } = require("../../../errors");

class BaseController {
  constructor(theModel) {
    this.theModel = theModel;
    this.theModuleName = _.upperFirst(this.theModel.collection.collectionName);

    // CREATE
    this.createNew = this.createNew.bind(this);
    // READ
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    // UPDATE
    this.updateById = this.updateById.bind(this);
    // DELETE
    this.removeById = this.removeById.bind(this);
  }

  async createNew(req, res, next) {
    try {
      const thing = req.body;
      assert(_.isObject(thing), `${this.theModuleName} is not a valid object.`);

      const { user } = req;

      const newThing = await this.theModel.createNew(thing, user);
      res.status(201).json(newThing);
    } catch (error) {
      const throwable = normalizeAndLogError(this.theModuleName, res, error);
      next(throwable);
    }
  }

  async getAll(req, res, next) {
    try {
      const { user } = req;
      const { shapedQuery } = req;

      const things = await this.theModel.getAll(shapedQuery, user);
      res.status(200).json(things);
    } catch (error) {
      const throwable = normalizeAndLogError(this.theModuleName, res, error);
      next(throwable);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      assert(ObjectId.isValid(id), "Id is not a valid ObjectId.");

      const { user } = req;

      const thing = await this.theModel.getById(id, user);

      if (!thing) {
        throw new ValidationError(70, 404, `${this.theModuleName} does not exist or does not belong to your account.`);
      }
      res.status(200).json(thing);
    } catch (error) {
      const throwable = normalizeAndLogError(this.theModuleName, res, error);
      next(throwable);
    }
  }

  async updateById(req, res, next) {
    try {
      const { id } = req.params;
      const { user } = req;
      const thing = req.body;

      assert(ObjectId.isValid(id), "Id is not a valid ObjectId.");
      assert(_.isObject(thing), `${this.theModuleName} is not a valid object.`);

      const updatedThing = await this.theModel.updateById(id, thing, user);

      if (!updatedThing) {
        throw new ValidationError(70, 404, `${this.theModuleName} not found.`);
      }
      res.status(200).json(updatedThing);
    } catch (error) {
      const throwable = normalizeAndLogError(this.theModuleName, res, error);
      next(throwable);
    }
  }

  async removeById(req, res, next) {
    try {
      const { id } = req.params;
      const { user } = req;

      assert(ObjectId.isValid(id), "Id is not a valid ObjectId.");

      const deleteResults = await this.theModel.removeById(id, user);
      if (deleteResults.nModified === 0) {
        throw new ValidationError(70, 404, `${this.theModuleName} not found.`);
      }
      res.status(204).json();
    } catch (error) {
      const throwable = normalizeAndLogError(this.theModuleName, res, error);
      next(throwable);
    }
  }
}

module.exports = { BaseController };
