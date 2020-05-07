// const guard = require("express-jwt-permissions")();
const { normalizeAndLogError, PermissionError } = require("../errors");

const checkPermissions = guards => (req, res, next) => {
  function isString(value) {
    return typeof value === "string";
  }

  function isArray(value) {
    return value instanceof Array;
  }

  try {
    if (isString(guards)) {
      guards = [[guards]];
    } else if (isArray(guards) && guards.every(isString)) {
      guards = [guards];
    }

    if (req.user.permissions.length === 0) {
      return next(new PermissionError(401, 401, "User has no assigned permisions"));
    }

    const sufficient = guards.some((required) => {
      return required.every((permission) => {
        return req.user.permissions.indexOf(permission) !== -1;
      });
    });

    if (!sufficient) {
      return next(new PermissionError(403, 403, "User has no sufficient permisions"));
    }

    return next();
  } catch (error) {
    const throwable = normalizeAndLogError("PermissionError", req, error);
    next(throwable);
  }
};

module.exports = { checkPermissions };
