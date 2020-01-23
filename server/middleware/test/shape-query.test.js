const { expect } = require("chai");
const { stub, match } = require("sinon");
const { mockRequest, mockResponse } = require("mock-req-res");
const { checkJwt } = require("../check-jwt");
const { AuthenticationError } = require("../../errors");

require("dotenv").config();
require("../../server");

describe("shapeQuery middleware", () => {

});
