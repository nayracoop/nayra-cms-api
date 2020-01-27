const crypto = require("crypto");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const _ = require("lodash");
const assert = require("assert");

const { ObjectId } = mongoose.Types;
const { BaseController } = require("../../_base/controller/base-controller");
const { UserDao } = require("../dao/user-dao");
const { UserSchema } = require("../model/user-model");

const { AccountDao } = require("../../account/dao/account-dao");
const { AccountSchema } = require("../../account/model/account-model");
const { AuthenticationError, normalizeAndLogError } = require("../../../errors");

const { JWT_SECRET } = process.env;

class UserController extends BaseController {
  constructor() {
    const user = new UserDao(UserSchema, "User").getModel();
    super(user);

    this.user = user;
    this.account = new AccountDao(AccountSchema, "Account").getModel();

    this.createNew = this.createNew.bind(this);
    this.login = this.login.bind(this);
    // this.confirmEmail = this.confirmEmail.bind(this);
    this.signup = this.signup.bind(this);
  }

  async createNew(req, res, next) {
    const createUser = async (err, buffer) => {
      try {
        if (err) {
          throw err;
        } else {
          const newUser = req.body;
          const opUser = req.user;
          // newUser.apiKey = buffer.toString("hex");

          assert(_.isObject(newUser), "User is not a valid object.");
          assert(_.isObject(opUser), "opUser is not a valid object.");
          assert(newUser.password, "Created user must have a password");

          const salt = crypto.randomBytes(16).toString("hex");
          const hash = crypto.pbkdf2Sync(newUser.password, salt, 1000, 64, "sha512").toString("hex");
          newUser.salt = salt;
          newUser.hash = hash;

          const user = await this.user.createNew(newUser, opUser);
          res.status(201).json(user);
        }
      } catch (error) {
        const throwable = normalizeAndLogError("User", res, error);
        next(throwable);
      }
    };
    // crypto randomBytes takes a cb to be async
    crypto.randomBytes(48, createUser);
  }

  async login(req, res, next) {
    passport.authenticate("local", { session: false }, async (err, user) => {
      try {
        if (err) {
          throw err;
        }
        // const account = await this.account.getById(user.accountId);
        // if (!account || !account.privateKey) {
        //   throw new AuthenticationError(9, 401, "Not authenticated.");
        // }
        // if (!account.isValid) {
        //   throw new AuthenticationError(10, 401, "Not authenticated.");
        // }
        // const token = jwt.sign(user.toObject(), account.privateKey);
        const token = jwt.sign(user.toJSON(), JWT_SECRET);

        res.status(200).json({ user: user.toJSON(), token });
      } catch (error) {
        const throwable = normalizeAndLogError("User", res, error);
        next(throwable);
      }
    })(req, res, next);
  }

  /**
   * To be defined the use case - not in use for now
   */
  // async confirmEmail(req, res, next) {
  //   try {
  //     const { id, email } = req.body;
  //     assert(ObjectId.isValid(id), "Id is not a valid ObjectId.");

  //     const user = await this.user.getById(id);
      
  //     if (!user) {
  //       throw new AuthenticationError(3, 401, "Not authenticated.");
  //     }
  //     if (user.email !== email) {
  //       throw new AuthenticationError(4, 401, "Invalid email to confirm");
  //     }
  //     await this.user.confirmEmail(id);
  //     res.status(204).end();
  //   } catch (error) {
  //     const throwable = normalizeAndLogError("User", res, error);
  //     next(throwable);
  //   }
  // }

  async signup(req, res, next) {
    const createUser = async (err, buffer) => {
      try {
        if (err) {
          res.status(500).send(err.toString());
        } else {
          const newUser = req.body;

          assert(_.isObject(newUser), "User is not a valid object.");

          // newUser.apiKey = buffer.toString("hex");
          if (!newUser.accountId) {
            const demoAccounts = await this.account.getAll({ name: "demo" });
            newUser.accountId = demoAccounts[0]._id;
          }

          const salt = crypto.randomBytes(16).toString("hex");
          const hash = crypto.pbkdf2Sync(newUser.password, salt, 1000, 64, "sha512").toString("hex");
          newUser.salt = salt;
          newUser.hash = hash;

          const user = await this.user.createNew(newUser, null);
          res.status(201).json(user);
        }
      } catch (error) {
        const throwable = normalizeAndLogError("User", res, error);
        next(throwable);
      }
      // crypto randomBytes takes a cb to be async
    };
    crypto.randomBytes(48, createUser);
  }
}

module.exports = { UserController };
