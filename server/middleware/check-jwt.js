const passport = require("passport");
const { normalizeAndLogError, AuthenticationError } = require("../errors");

const checkJwt = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      throw new AuthenticationError(5, 401, "Not authenticated.");
    }

    passport.authenticate("jwt", { session: false })(req, res, next);
  } catch (error) {
    // check api key loggea req en vez de res
    const throwable = normalizeAndLogError("checkJwt", res, error);
    next(throwable);
  }
};

module.exports = { checkJwt };
