const { validationResult } = require("express-validator");
const { normalizeAndLogError, ValidationError } = require("../errors");

const validateSchema = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));
      const errors = validationResult(req).array();
      if (errors.length) {
        const message = errors.map(e => e.msg).join(" / ");
        throw new ValidationError(422, 422, message);
      }
      return next();
    } catch (error) {
      const throwable = normalizeAndLogError("validateSchema", req, error);
      next(throwable);
    }
  };
};

module.exports = { validateSchema };
