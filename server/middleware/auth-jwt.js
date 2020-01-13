const passport = require("passport");
const { normalizeAndLogError } = require("../errors");

const authJwt = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false })(req, res, next);
  } catch (error) {
    const throwable = normalizeAndLogError("authJwt", res, error);
    next(throwable);
  }
};

module.exports = { authJwt };
