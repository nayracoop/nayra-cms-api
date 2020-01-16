const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JWTstrategy, ExtractJwt } = require("passport-jwt");

const { UserDao } = require("../api/user/dao/user-dao");
const { UserSchema } = require("../api/user/model/user-model");
// const { AccountDao } = require("../api/account/dao/account-dao");
// const { AccountSchema } = require("../api/account/model/account-model");
const { normalizeAndLogError, AuthenticationError } = require("../errors");

const { JWT_SECRET } = process.env;

class PassportConfig {
  static async init(app) {
    // const accountDao = new AccountDao(AccountSchema, "Account").getModel();
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


    passport.use(
      "jwt",
      new JWTstrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
        secretOrKey: JWT_SECRET
      },
      async (jwtPayload, cb) => {
        try {
          const user = await userDao.getByUsernameOrEmail(jwtPayload.username);
          if (!user) {
            throw new AuthenticationError(7, 401, "Not authenticated.");
          }
          // const account = await accountDao.getById(user.accountId);
          // if (!account) {
          //   throw new AuthenticationError(9, 401, "Not authenticated.");
          // }
          // if (!account.isValid) {
          //   throw new AuthenticationError(10, 401, "Not authenticated.");
          // }
          cb(null, user);
        } catch (error) {
          const throwable = normalizeAndLogError("passportJWTstrategy", { id: -1 }, error);
          cb(throwable);
        }
      })
    );

    app.use(passport.initialize());
  }
}

module.exports = { PassportConfig };
