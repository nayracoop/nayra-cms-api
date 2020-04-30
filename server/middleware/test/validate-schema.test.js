const { checkSchema } = require("express-validator");
const { mockRequest, mockResponse } = require("mock-req-res");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);
const { expect } = chai;

const { validateSchema } = require("../validate-schema");
const { ValidationError } = require("../../errors");

require("dotenv").config();
require("../../server");

describe("validateSchema middleware", () => {
  const testValidationSchema = {
    id: {
      isMongoId: true,
      optional: true,
      errorMessage: "'id' is not a valid MongoId"
    },
    email: {
      isEmail: true,
      optional: true,
      errorMessage: "'email' is not a valid email"
    }
  };

  it("should throw a 422 Validation Error if any field types are wrong", async () => {
    const req = mockRequest({
      body: {
        id: "holis",
        email: "isThisAnEmail?"
      }
    });
    const res = mockResponse();
    const expectedError = new ValidationError(422, 422, "'id' is not a valid MongoId / 'email' is not a valid email");
    const nextSpy = sinon.spy();
    await validateSchema(checkSchema(testValidationSchema))(req, res, nextSpy);
    // eslint-disable-next-line
    expect(nextSpy).to.have.been.calledOnce;
    expect(nextSpy.getCall(0).args[0].name).to.eql(expectedError.name);
    expect(nextSpy.getCall(0).args[0].message).to.eql(expectedError.message);
    expect(nextSpy.getCall(0).args[0].code).to.eql(expectedError.code);
  });

  it("should throw no error and continue with request if all types are correct", async () => {
    const req = mockRequest({
      body: {
        id: "5e46fa948b7f6816db5339d2",
        email: "good@email.coop"
      }
    });
    const res = mockResponse();
    const nextSpy = sinon.spy();
    await validateSchema(checkSchema(testValidationSchema))(req, res, nextSpy);
    expect(nextSpy).to.have.been.called;
  });
});
