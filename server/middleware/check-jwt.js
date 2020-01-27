const passport = require("passport");
const { normalizeAndLogError, AuthenticationError } = require("../errors");

const checkJwt = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new AuthenticationError(5, 401, "Not authenticated.");
    }
    passport.authenticate("jwt", { session: false }, (err, user, info, status) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).send({
          "error": {
            "code": "INVALID_AUTHORIZATION_CODE",
            "message": "Invalid authorization code"
          }
        });
      }
      req.user = user;
      return next();
    })(req, res, next);
  } catch (error) {
    const throwable = normalizeAndLogError("checkJwt", req, error);
    next(throwable);
  }
};

module.exports = { checkJwt };
