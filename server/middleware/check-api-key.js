const passport = require("passport");
const { normalizeAndLogError } = require("../errors");

const checkApiKey = async (req, res, next) => {
  try {
    passport.authenticate("headerapikey", { session: false })(req, res, next);
  } catch (error) {
    const throwable = normalizeAndLogError("checkApiKey", res, error);
    next(throwable);
  }
};

module.exports = { checkApiKey };
