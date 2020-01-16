const { expect, assert } = require("chai");
const request = require("supertest");
const fixtures = require("node-mongoose-fixtures");
const crypto = require("crypto");
const { Types } = require("mongoose");


require("dotenv").config();

const app = require("../../../server");

describe("User", () => {
  // for test purposes, all passwords are '123456'
  const password = "123456";

  before(() => {
    const salt = crypto.randomBytes(16).toString("hex");

    fixtures.save("users", {
      User: [
        {
          accountId: Types.ObjectId(),
          username: "username1",
          email: "username1@nayra.coop",
          emailConfirmed: true,
          hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
          salt
        },
        {
          accountId: Types.ObjectId(),
          username: "username2",
          email: "username2@nayra.coop",
          emailConfirmed: true,
          hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
          salt
        }
      ]
    });

    fixtures("users", (err, _data) => {
      if (err) {
        console.error("fixture error", err);
      }
    });
  });

  after(() => {
    fixtures.reset();
  });

  context("login", () => {
    it("should login and return a token if a existing username and password are provided", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "username1", password })
        .expect("Content-Type", /json/)
        .expect(200)
        .then(() => {
          // TO-DO what should login return?
          done();
        });
    });

    it("should return an error if the provided password is wrong and add a failed login attempt into the user", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "username1", password: "wrong password" })
        .expect("Content-Type", /json/)
        .expect(401)
        .then((res) => {
          expect(res.body.name).to.eql("AuthenticationError");
          expect(res.body.code).to.eql(1);
          expect(res.body.message).to.eql("Not authenticated.");

          // TO-DO check failed login attempts length is 1
          const users = fixtures.get("users").User;
          const user = users.find(u => u.username === "username1");
          console.log(user.failedLoginAttempts);
          done();
        });
    });


    it("should return 401 if the provided username does not exist", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "wrongUsername", password })
        .expect("Content-Type", /json/)
        .expect(401)
        .expect((res) => {
          res.body.name = "AuthenticationError";
          res.body.code = 3;
          res.body.message = "Not authenticated.";
        })
        .then(() => { done(); });
    });
  });
});
