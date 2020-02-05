const assert = require("assert");
const { normalizeAndLogError } = require("../errors");

const fieldIsContainedInModelKeys = (keys, field) => {
  const normalizedField = field.replace(/^-/, "");
  return keys.includes(normalizedField);
};

const validatePaginationQuery = (model, {
  perPage, page, sortBy, showUpdates
}) => {
  if (page) {
    assert(Number.isSafeInteger(+page), `Page number value value must be numeric, but received: ${page}`);
    assert(+page >= 0, `Page number value must be non-negative, but received: ${page}`);
  }
  if (perPage) {
    assert(Number.isSafeInteger(+perPage), `Items per page value must be numeric, but received: ${perPage}`);
    assert(+perPage >= 0, `Items per page value must be non-negative, but received: ${perPage}`);
  }
  if (showUpdates) {
    assert(showUpdates === "true" || showUpdates === "false", `Show updates filter can only be set to 'true' or 'false', but received: '${showUpdates}'`);
  }
  if (sortBy) {
    assert(fieldIsContainedInModelKeys(Object.keys(model.obj), sortBy), `Sort by field defined (${sortBy}) does not match a valid model property`);
  }
};

const validateFieldsQuery = (model, fieldsQuery) => {
  const modelKeys = Object.keys(model.obj);
  Object.keys(fieldsQuery).forEach((key) => {
    assert(fieldIsContainedInModelKeys(modelKeys, key), `Filter for field defined (${key}) does not match a valid model property`);
    // notForQuery is a custom property added in model in order to avoid queryinq by sensible data
    assert(!model.obj[key].notForQuery, `Filter for field defined (${key}) is not permitted`);
  });
  Object.entries(fieldsQuery).forEach((entry) => {
    assert(entry[1] !== "", `Filter for field defined (${entry[0]}) cannot be empty`);
  });
};

const castQueryToRegex = (model, query) => {
  const regexQuery = {};

  Object.entries(query).forEach((entry) => {
    const key = entry[0];
    if (model.obj[key].type !== String) {
      regexQuery[key] =  entry[1];
    } else {
      regexQuery[key] = { $regex: new RegExp(entry[1], "ig") };
    }
  });
  return regexQuery;
};

const castBooleanParams = (model, fieldsQuery) => {
  const query = {};
  Object.keys(fieldsQuery).forEach((key) => {
    if (model.obj[key].type === Boolean) {

      query[key] = fieldsQuery[key] === "true" ? true : false;
    } else {
      query[key] = fieldsQuery[key];
    }
  });

  return query;
};

// TO DO refactor in order to avoid many loops of params array/object
// castQueryToRegex and  castBooleanParams can be maybe unified
const shapeQuery = model => async (req, res, next) => {
  try {
    const { query: reqQuery } = req;
    const {
      perPage, page, showUpdates, sortBy, ...query
    } = reqQuery;

    validatePaginationQuery(model, reqQuery);
    validateFieldsQuery(model, query);
    const queryWithBooleans = castBooleanParams(model, query);

    const limit = +perPage || 5;
    const currentPage = +page || 1;
    const skip = +limit * (+currentPage - 1) || 0;
    const select = showUpdates === "true" ? "+updated" : "-updated";
    const sort = sortBy || "_id";
    const regexQuery = castQueryToRegex(model, queryWithBooleans);
    req.shapedQuery = {
      skip,
      limit,
      select,
      sort,
      query: regexQuery
    };
    next();
  } catch (error) {
    const throwable = normalizeAndLogError("shapeQuery", req, error);
    next(throwable);
  }
};

module.exports = { shapeQuery };
