const { expect } = require("chai");
const { stub, match } = require("sinon");
const { mockRequest, mockResponse } = require("mock-req-res");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fixtures = require("node-mongoose-fixtures");
const jwt = require("jsonwebtoken");

const { checkJwt } = require("../check-jwt");
const { AuthenticationError } = require("../../errors");

require("dotenv").config();
require("../../server");
// consider to use a secret for tests?
const { JWT_SECRET } = process.env;

describe("checkJwt middleware", () => {
  const res = mockResponse();

  it("should throw AuthenticationError if Authorization header is not present", () => {
    const req = mockRequest({ body: { } });

    checkJwt(req, res, (error) => {
      expect(error).to.be.an.instanceof(AuthenticationError);
      expect(error.code).to.be.eql(5);
      expect(error.statusCode).to.be.eql(401);
      expect(error.message).to.be.eql("Not authenticated.");
    });
  });

  // currently not throwing error and not authenticating either
  it.skip("should throw AuthenticationError if Authorization token is not valid", () => {
    const req = mockRequest({
      body: { },
      headers: { Authorization: "Bearer token" },
      get(name) {
        if (name === "Authorization") return this.headers.Authorization;
        return null;
      }
    });
    checkJwt(req, res, (error) => {
      // it is not getting here
      console.log(error);
      expect(error).to.be.eql("helo");
    }).catch((error) => {
      return console.log(error);
    });
  });

  // error valid token belongs to unexisting user (error 7)
  it.skip("should throw AuthenticationError if Authorization token is not valid", () => {
    const token = jwt.sign({ username: "test", email: "test@test" }, JWT_SECRET);
    const req = mockRequest({
      body: { },
      headers: { Authorization: `Bearer ${token}` },
      get(name) {
        if (name === "Authorization") return this.headers.Authorization;
        return null;
      }
    });

    checkJwt(req, res, (error) => {
      expect(error).to.be.an.instanceof(AuthenticationError);
      console.log(error);
    });
  });

  // happy case: token belongs to existing user
  it.skip("should throw AuthenticationError if Authorization token is not valid", (done) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const users = [
      {
        accountId: mongoose.Types.ObjectId(),
        username: "username1",
        email: "username1@nayra.coop",
        emailConfirmed: true,
        hash: crypto.pbkdf2Sync("123456", salt, 1000, 64, "sha512").toString("hex"),
        salt
      },
      {
        accountId: mongoose.Types.ObjectId(),
        username: "username2",
        email: "username2@nayra.coop",
        emailConfirmed: true,
        hash: crypto.pbkdf2Sync("123456", salt, 1000, 64, "sha512").toString("hex"),
        salt
      }
    ];

    fixtures.save("users", {
      User: users
    });
    fixtures("users", (err, _data) => {
      if (err) {
        console.error("Fixture error", err);
      }
    });

    const token = jwt.sign(users[0], JWT_SECRET);
    const req = mockRequest({
      body: { },
      headers: { Authorization: `Bearer ${token}` },
      get(name) {
        if (name === "Authorization") return this.headers.Authorization;
        return null;
      }
    });
    checkJwt(req, res, (error) => {
      expect(error).to.be.an.instanceof(AuthenticationError);
    }).then((...things) => {
      console.log("thing", things);

      done();
    });
  });
});
