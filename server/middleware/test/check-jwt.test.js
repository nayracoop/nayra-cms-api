const { expect } = require("chai");
const { stub, match } = require("sinon");
const { mockRequest, mockResponse } = require("mock-req-res");
const { checkJwt } = require("../check-jwt");
const { AuthenticationError } = require("../../errors");

require("dotenv").config();
require("../../server");

describe("checkJwt middleware", () => {
  const res = mockResponse();

  it("should throw AuthenticationError if Authorization header is not present", () => {
    const req = mockRequest({ body: { } });

    checkJwt(req, res, (error) => {
      expect(error).to.be.an.instanceof(AuthenticationError);
    });
  });
});
