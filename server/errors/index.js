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

const normalizeAndLogError = (moduleName, { id }, error) => {
  let throwable = error;

  switch (error.name) {
    case "UnexpectedError":
    case "PermissionError":
    case "AuthenticationError":
      break;
    case "ValidationError":
      throwable = new ValidationError(error.code || 80, error.statusCode || 422, error.message);
      break;
    case "AssertionError":
    case "AssertionError [ERR_ASSERTION]":
      throwable = new ValidationError(1, 422, error.message);
      break;
    default:
      throwable = new UnexpectedError(99, 500, error.message);
      break;
  }

  const logger = LoggerConfig.getChild(moduleName, id, throwable, throwable.statusCode);
  logger.error(throwable.message);

  return throwable;
};

const handleError = (error, req, res, _next) => {
  const status = error.statusCode || 500;
  const { name, code, message } = error;
  res.status(status).json({ name, code, message });
};

// 01, '[Assertion error message]'
// 20, 'Query not associated to a pda'
// 21, 'Pda not associated to an event'
// 22, 'No pos associated to pda'
// 30, 'Event days not configured'
// 31, 'No currency associated to the event'
// 70, 'Resource not found'
// 80, 'Malformed entity'
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

module.exports = {
  ValidationError,
  PermissionError,
  AuthenticationError,
  UnexpectedError,
  normalizeAndLogError,
  handleError
};
