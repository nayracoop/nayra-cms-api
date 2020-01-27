const { expect } = require("chai");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fixtures = require("node-mongoose-fixtures");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const { checkJwt } = require("../check-jwt");

require("dotenv").config();
const app = require("../../server");
// consider to use a secret for tests?
const { JWT_SECRET } = process.env;

describe("checkJwt middleware", () => {
  afterEach(() => {
    fixtures.reset();
  });

  it("should throw AuthenticationError if Authorization header is not present", (done) => {
    request(app)
      .get("/api/users")
      .expect(401)
      .then((res) => {
        expect(res.body.name).to.be.eql("AuthenticationError");
        expect(res.body.code).to.be.eql(5);
        expect(res.body.message).to.be.eql("Not authenticated.");
        done();
      })
      .catch(done);
  });

  it("should throw AuthenticationError if Authorization token is not valid", (done) => {
    const expectedError = {
      error: {
        code: "INVALID_AUTHORIZATION_CODE",
        message: "Invalid authorization code"
      }
    };

    request(app)
      .get("/api/users")
      .set("Authorization", "Bearer notAtoken")
      .expect(401)
      .then((res) => {
        expect(res.body).to.eql(expectedError);
        done();
      })
      .catch(done);
  });

  it("should throw AuthenticationError if Authorization token belongs to unexisting user", (done) => {
    const token = jwt.sign({ username: "test", email: "test@test" }, JWT_SECRET);
    request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(401)
      .then((res) => {
        expect(res.body.name).to.be.eql("AuthenticationError");
        expect(res.body.code).to.be.eql(7);
        expect(res.body.message).to.be.eql("Not authenticated.");
        done();
      })
      .catch(done);
  });

  it("should add user to req if token is valid and belongs to a existing user", (done) => {
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

    request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then(() => {
        done();
      })
      .catch(done);
  });
});
