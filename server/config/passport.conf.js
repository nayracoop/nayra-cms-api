const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { HeaderAPIKeyStrategy } = require("passport-headerapikey");

const { UserDao } = require("../api/user/dao/user-dao");
const { UserSchema } = require("../api/user/model/user-model");
const { AccountDao } = require("../api/account/dao/account-dao");
const { AccountSchema } = require("../api/account/model/account-model");
const { normalizeAndLogError, AuthenticationError } = require("../errors");

class PassportConfig {
  static async init(app) {
    const accountDao = new AccountDao(AccountSchema, "Account").getModel();
    const userDao = new UserDao(UserSchema, "User").getModel();

    passport.use(new LocalStrategy(
      async (username, password, cb) => {
        try {
          const user = await userDao.getByUsernameOrEmail(username);
          if (!user) {
            throw new AuthenticationError(3, 401, "Not authenticated.");
          }
          if (!user.validPassword(password)) {
            user.newFailedLoginAttempt(password);
            throw new AuthenticationError(1, 401, "Not authenticated.");
          }
          return cb(null, user);
        } catch (error) {
          const throwable = normalizeAndLogError("passportLocalStrategy", { id: -1 }, error);
          return cb(throwable);
        }
      },
    ));

    const apikeyOptions = {
      header: "x-api-key",
      prefix: ""
    };

    passport.use(new HeaderAPIKeyStrategy(apikeyOptions, true,
      async (apikey, cb) => {
        try {
          const user = await userDao.getByApiKey(apikey);
          if (!user) {
            throw new AuthenticationError(3, 401, "Not authenticated.");
          }
          const account = await accountDao.getById(user.accountId);
          if (!account) {
            throw new AuthenticationError(9, 401, "Not authenticated.");
          }
          if (!account.isValid) {
            throw new AuthenticationError(10, 401, "Not authenticated.");
          }
          return cb(null, user);
        } catch (error) {
          const throwable = normalizeAndLogError("passportHeaderAPIKeyStrategy", { id: -1 }, error);
          return cb(throwable);
        }
      }));

    app.use(passport.initialize());
  }
}

module.exports = { PassportConfig };
