/* eslint-disable no-use-before-define */
const { LoggerConfig } = require("../config/logger.config");

class CustomError extends Error {
  constructor(code, statusCode, message) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.message = message;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        statusCode: this.statusCode,
        name: this.name,
        message: this.message,
        stacktrace: this.stack
      }
    };
  }
}

// the exposed via API REST (or end user) error should be different from the server logging
// e.g. don't expose mongo especific error in response use 4xx or 5xx codes instead
const normalizeAndLogError = (moduleName, { id }, error) => {
  let throwable = error;

  switch (error.name) {
    case "UnexpectedError":
    case "PermissionError":
    case "MongoError":
      // catch duplicate key errors
      if (error.code === 11000) {
        throwable.statusCode = 422;
        throwable.message = "Not available or duplicated field";
        throwable.name = "NotAvailableError";
        throwable.code = 422;
      }
      break;
    case "StrictModeError":
      throwable = new ValidationError(error.code || 422, error.statusCode || 422, error.message);
      break;
    case "AuthenticationError":
      break;
    case "BadRequestError":
      break;
    case "NotFoundError":
      break;
    case "ValidationError":
      throwable = new ValidationError(error.code || 422, error.statusCode || 422, error.message);
      break;
    case "AssertionError":
    case "AssertionError [ERR_ASSERTION]":
      throwable = new ValidationError(422, 422, error.message);
      break;
    default:
      throwable = new UnexpectedError(500, 500, error.message);
      break;
  }

  const logger = LoggerConfig.getChild(moduleName, id, throwable, throwable.statusCode);
  // internaly log the error
  logger.error(error);

  return throwable;
};

const handleError = (error, req, res, _next) => {
  const status = error.statusCode || 500;
  const { name, message } = error;
  // hide authentication error codes from the response
  const code = status === 401 ? status : error.code;
  res.status(status).json({ name, code, message });
};


class ValidationError extends CustomError {
  constructor(code, statusCode, message) {
    super(code, statusCode, message);
    this.name = "ValidationError";
  }
}

class PermissionError extends CustomError {
  constructor(code, statusCode, message) {
    super(code, statusCode, message);
    this.name = "PermissionError";
  }
}
/*  // these error codes are deprecated
    // 01, 'Incorrect username or password'
    // 02, 'Unknown authentication error'
    // 03, 'Unexistent user'
    // 04, 'Invalid email to confirm'
    // 05, 'JWT Authorization headers not set'
    // 06, 'JWT account not found in ApiKey or privateKey not set'
    // 07, 'JWT User not found'
    // 08, 'JWT User found but not a match with ApiKey'
    // 09, 'Account not found in ApiKey or privateKey not set'
    // 10, 'Account invalid'
    // 11, 'No super admin'
*/
class AuthenticationError extends CustomError {
  constructor(code, statusCode, message) {
    super(code, statusCode, message);
    this.name = "AuthenticationError";
  }
}

class UnexpectedError extends CustomError {
  constructor(code, statusCode, message) {
    super(code, statusCode, message);
    this.name = "UnexpectedError";
  }
}

class BadRequestError extends CustomError {
  constructor(code, statusCode, message) {
    super(400, 400, message);
    this.name = "BadRequestError";
  }
}

class NotFoundError extends CustomError {
  constructor(code, statusCode, message) {
    super(404, 404, message);
    this.name = "NotFoundError";
  }
}

module.exports = {
  ValidationError,
  PermissionError,
  AuthenticationError,
  UnexpectedError,
  BadRequestError,
  NotFoundError,
  normalizeAndLogError,
  handleError
};
