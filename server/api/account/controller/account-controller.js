const uuidv4 = require("uuid/v4");
const _ = require("lodash");
const assert = require("assert");
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;
const { BaseController } = require("../../_base/controller/base-controller");
const { AccountDao } = require("../dao/account-dao");
const { AccountSchema } = require("../model/account-model");
const { normalizeAndLogError, ValidationError } = require("../../../errors");

class AccountController extends BaseController {
  constructor() {
    const account = new AccountDao(AccountSchema, "Account").getModel();
    super(account);

    this.account = account;

    this.createNew = this.createNew.bind(this);
    this.getById = this.getById.bind(this);
    this.updateById = this.updateById.bind(this);
  }

  async createNew(req, res, next) {
    try {
      const account = req.body;
      assert(_.isObject(account), "Account is not a valid object.");

      const { user } = req;

      account.privateKey = uuidv4();

      const newAccount = await this.account.createNew(account, user);
      res.status(201).json(newAccount);
    } catch (error) {
      const throwable = normalizeAndLogError("Account", res, error);
      next(throwable);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      assert(ObjectId.isValid(id), "Id is not a valid ObjectId.");

      const isSuperAdmin = await this.account.isSuperAdmin(req.user.accountId);
      assert(isSuperAdmin || id === req.user.accountId.toString(), "Request user's accountId is not super admin and is requesting for an external accountId.");

      const account = await this.account.getById(id);
      res.status(200).json(account);
    } catch (error) {
      const throwable = normalizeAndLogError("Account", res, error);
      next(throwable);
    }
  }

  async updateById(req, res, next) {
    try {
      const { id } = req.params;
      const { user } = req;
      const account = req.body;

      assert(ObjectId.isValid(id), new TypeError("Id is not a valid ObjectId."));
      assert(_.isObject(account), new TypeError("Account is not a valid object."));

      const isSuperAdmin = await this.account.isSuperAdmin(user.accountId);
      assert(isSuperAdmin || id === user.accountId.toString(), "Request user's accountId is not super admin and is trying to update an external accountId.");

      const updatedAccount = await this.account.updateById(id, account, user);

      if (!updatedAccount) {
        throw new ValidationError(70, 404, "Account not found.");
      }
      res.status(200).json(updatedAccount);
    } catch (error) {
      const throwable = normalizeAndLogError("Account", res, error);
      next(throwable);
    }
  }
}

module.exports = { AccountController };
