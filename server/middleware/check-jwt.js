const assert = require("assert");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { AccountDao } = require("../api/account/dao/account-dao");
const { AccountSchema } = require("../api/account/model/account-model");
const { normalizeAndLogError, AuthenticationError } = require("../errors");

const checkJwt = async (req, res, next) => {
  try {
    const accountDao = new AccountDao(AccountSchema, "Account").getModel();
    assert(_.isObject(req.user), "User is not a valid object.");

    const authHeader = req.header("Authorization");

    if (!authHeader) {
      throw new AuthenticationError(5, 401, "Not authenticated.");
    }

    const authToken = authHeader.replace(/^Bearer /, "");
    const account = await accountDao.getById(req.user.accountId);
    if (!account || !account.privateKey) {
      throw new AuthenticationError(6, 401, "Not authenticated.");
    }
    const user = jwt.verify(authToken, account.privateKey);
    if (!user) {
      throw new AuthenticationError(7, 401, "Not authenticated.");
    }
    if (req.user._id.toString() !== user._id.toString()) {
      throw new AuthenticationError(8, 401, "Not authenticated.");
    }
    next();
  } catch (error) {
    const throwable = normalizeAndLogError("checkJwt", req, error);
    next(throwable);
  }
};

module.exports = { checkJwt };
