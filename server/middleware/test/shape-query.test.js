const { expect } = require("chai");
const { stub, match } = require("sinon");
const { mockRequest, mockResponse } = require("mock-req-res");
const { shapeQuery } = require("../shape-query");
const { AuthenticationError } = require("../../errors");

require("dotenv").config();
require("../../server");

describe("shapeQuery middleware", () => {

});
