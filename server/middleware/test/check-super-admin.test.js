const { expect } = require("chai");
const { stub, match } = require("sinon");
const { mockRequest, mockResponse } = require("mock-req-res");
const { checkSuperAdmin } = require("../check-super-admin");
const { AuthenticationError } = require("../../errors");

require("dotenv").config();
require("../../server");

describe("checkSuperAdmin middleware", () => {

});
