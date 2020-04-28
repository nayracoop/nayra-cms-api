const { normalizeAndLogError, ValidationError } = require("../errors");
const { validationResult } = require("express-validator");

const validateSchema = (validations) => {
  // for now, this function only validates TYPES ,
  // required/optional field validation is more tricky,
  // as POST/SINGUP demand some fields to be required but
  // PUT does not have any required fields
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
