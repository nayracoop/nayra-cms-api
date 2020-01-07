const assert = require("assert");
const _ = require("lodash");
const { AccountDao } = require("../api/account/dao/account-dao");
const { normalizeAndLogError, AuthenticationError } = require("../errors");

const checkSuperAdmin = async (req, res, next) => {
  try {
    const { user, params } = req;
    const { id } = params || {};
    assert(_.isObject(user), "User is not a valid object.");

    const account = await AccountDao.getById(user.accountId);
    if (!user.isSuperAdmin && id !== account._id.toString()) {
      throw new AuthenticationError(11, 401, "No super admin on external resource.");
    }

    next();
  } catch (error) {
    const throwable = normalizeAndLogError("checkSuperAdmin", req, error);
    next(throwable);
  }
};

module.exports = { checkSuperAdmin };
