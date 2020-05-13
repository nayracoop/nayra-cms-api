// const guard = require("express-jwt-permissions")();
const { normalizeAndLogError, PermissionError } = require("../errors");

function isString(value) {
  return typeof value === "string";
}

function isArray(value) {
  return value instanceof Array;
}

/**
 * 
 * @param {String | Array} guards are the endpoint required permissions
 * @param {Array} userPermisions the req.user.permissions array
 */
const hasPermissions = (guards, userPermisions) => {
  if (isString(guards)) {
    guards = [[guards]];
  } else if (isArray(guards) && guards.every(isString)) {
    guards = [guards];
  }

  return guards.some((required) => {
    return required.every((permission) => {
      return userPermisions.indexOf(permission) !== -1;
    });
  });
};

const checkPermissions = guards => (req, res, next) => {
  try {
    if (req.user.permissions.length === 0) {
      return next(new PermissionError(401, 401, "User has no assigned permisions"));
    }

    const sufficient = hasPermissions(guards, req.user.permissions);
    if (!sufficient) {
      return next(new PermissionError(403, 403, "User has no sufficient permisions"));
    }

    return next();
  } catch (error) {
    const throwable = normalizeAndLogError("PermissionError", 403, 403);
    next(throwable);
  }
};

module.exports = { checkPermissions, hasPermissions };
