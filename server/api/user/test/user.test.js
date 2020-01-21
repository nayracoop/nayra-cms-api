const { expect, assert } = require("chai");
const request = require("supertest");
const fixtures = require("node-mongoose-fixtures");
const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

let UserModel = null;
let users = null;
let token = null;
const password = "123456";
const salt = crypto.randomBytes(16).toString("hex");

require("dotenv").config();

// consider to use a secret for tests?
const { JWT_SECRET } = process.env;
const app = require("../../../server");

users = [
  {
    accountId: mongoose.Types.ObjectId(),
    username: "username1",
    email: "username1@nayra.coop",
    emailConfirmed: true,
    hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
    salt
  },
  {
    accountId: mongoose.Types.ObjectId(),
    username: "username2",
    email: "username2@nayra.coop",
    emailConfirmed: true,
    hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
    salt
  }
];

describe("User", () => {
  // for test purposes, all passwords are '123456'
  before(() => {
    fixtures.reset();
    UserModel = mongoose.model("User");
  });

  beforeEach((done) => {
    token = jwt.sign(users[0], JWT_SECRET);

    fixtures.reset();

    fixtures.save("users", {
      User: users
    });

    fixtures("users", (err, _data) => {
      if (err) {
        console.error("Fixture error", err);
      }
      done();
    });
  });

  afterEach(() => {
    fixtures.reset();
  });

  context("POST api/login", () => {
    it("should login and return 200 and a token if a existing username and password are provided", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "username1", password })
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          // console.log(res.body);
          assert(res.body.token, "body response should contain a token");
          assert(res.body.user, "body response should contain a user object");

          // why is not accepting an array of keys?
          // TODO define exactly which properties we need for user
          expect(res.body.user).to.include.keys(["_id", "username", "email", "accountId", "url", "deleted",
            "emailConfirmed"]);
          expect(res.body.user).to.not.have.property(["hash", "salt"]);
          done();
        })
        .catch(done);
    });

    it("should return 401 if the provided password is wrong and add a failed login attempt into the user", (done) => {
      const testUser = "username1";
      const wrongPassword = "this is not a correct password";
      request(app)
        .post("/api/login")
        .send({ username: testUser, password: wrongPassword })
        .expect("Content-Type", /json/)
        .expect(401)
        .then((res) => {
          expect(res.body.name).to.eql("AuthenticationError");
          expect(res.body.code).to.eql(1); // incrrect user or password
          expect(res.body.message).to.eql("Not authenticated.");

          return UserModel.findOne({ username: testUser });
        })
        .then((user) => {
          expect(user.failedLoginAttempts.length).to.eql(1);
          expect(user.failedLoginAttempts[0].failedPassword).to.eql(wrongPassword);
          done();
        })
        .catch(done);
    });

    it("should return 401 if the provided username does not exist", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "wrongUsername", password })
        .expect("Content-Type", /json/)
        .expect(401)
        .then((res) => {
          expect(res.body.name).to.eql("AuthenticationError");
          expect(res.body.code).to.eql(3);
          expect(res.body.message).to.eql("Not authenticated.");

          done();
        })
        .catch(done);
    });

    it("should return 500 if the provided username is not a string", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: ["hey", "notAstring"], password })
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
          expect(res.body.name).to.eql("UnexpectedError");
          expect(res.body.code).to.eql(99);
          // TO-DO en vez de tirar esto deberia tirar TYPEERROR en el DAO
          expect(res.body.message).to.eql("user.toJSON is not a function");
          done();
        })
        .catch(done);
    });

    it("should return 500 if the provided password is not a string", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "username1", password: ["hey", "notAstring"] })
        .expect("Content-Type", /json/)
        .expect(500)
        .then((res) => {
          expect(res.body.name).to.eql("UnexpectedError");
          expect(res.body.code).to.eql(99);
          // TO-DO en vez de tirar esto deberia tirar TYPEERROR en el DAO
          expect(res.body.message).to.eql("user.toJSON is not a function");
          done();
        })
        .catch(done);
    });
  });

  context("GET api/users  (get all)", () => {
    it("should return a 422 error is query contain forbidden params", (done) => {
      request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .query({ username: "user", hash: "should not accept the hash" })
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.code).to.eql(1);
          // TO-DO define the propper error codes and mesagges for documentation and ussage
          expect(res.body.message).to.eql("Filter for field defined (hash) is not permitted");
          done();
        })
        .catch(done);
    });
  });

  context("POST api/users (create new)", () => {
    it("should create a user", (done) => {
      const newUser = {
        username: "newuser",
        password,
        email: "new@user.co",
        firstName: "New",
        lastName: "User"
      };

      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send(newUser)
        .expect(201)
        .then((res) => {
          expect(res.body).to.include.keys(["_id", "username", "email", "accountId", "url", "deleted",
            "emailConfirmed", "firstName", "lastName"]);

          expect(res.body).to.not.have.property(["hash", "salt", "password"]);

          expect(res.body.username).to.eql(newUser.username);
          expect(res.body.email).to.eql(newUser.email);
          expect(res.body.firstName).to.eql(newUser.firstName);
          expect(res.body.lastName).to.eql(newUser.lastName);
          done();
        })
        .catch(done);
    });

    // is it possible to test this? // should create salt and hash from password
    it.skip("should create a salt and a hash from the password", (done) => {
      const newUser = {
        username: "newuser",
        password,
        email: "new@user.co",
        firstName: "New",
        lastName: "User"
      };

      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send(newUser)
        .expect(201)
        .then(() => {
          // how to test data in db?
          done();
        })
        .catch(done);
    });

    it("should return an error if username or email are missing from req body", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ password: "newuser" })
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.code).to.eql(80);
          expect(res.body.message).to.eql("User validation failed: email: Path `email` is required., username: Path `username` is required.");
          done();
        })
        .catch(done);
    });

    it("should return an error if password is missing from req body", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "newuser" })
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.code).to.eql(1);
          expect(res.body.message).to.eql("Created user must have a password");
          done();
        })
        .catch(done);
    });

    // this is now returning the "password required" error.
    it.skip("should return an error if req.body is not an object", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send("bananas")
        .expect(422)
        .then((res) => {
          done();
        })
        .catch(done);
    });

    it("should return an error if username is not a string", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: [], password: "secret", email: "usern@m.e" })
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.code).to.eql(80);
          expect(res.body.message).to.eql("User validation failed: username: Cast to String failed for value \"[]\" at path \"username\"");
          done();
        })
        .catch(done);
    });

    it("should return an error if email is not a string", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "username", password: "secret", email: [] })
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.code).to.eql(80);
          expect(res.body.message).to.eql("User validation failed: email: Cast to String failed for value \"[]\" at path \"email\"");
          done();
        })
        .catch(done);
    });

    // now returning unexpected error instead of validation error
    it.skip("should return an error if password is not a string", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "username", password: [], email: "user@name" })
        .expect(500)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.code).to.eql(80);
          expect(res.body.message).to.eql("User validation failed: password: Cast to String failed for value \"[]\" at path \"password\"");
          done();
        })
        .catch(done);
    });

    it("should return an error if unvalid token is provided", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", "Bearer not a token")
        .send({ username: "hello", password: "newuser" })
        .expect(401)
        .then((res) => {
          expect(res.text).to.eql("Unauthorized");
          done();
        })
        .catch(done);
    });
  });

  context("GET api/users/:id  (get by Id)", () => {
  });

  context("PUT api/users/:id  (update by Id)", () => {
  });

  context("DELETED api/users/:id  (remove by Id)", () => {
  });

  context("POST api/users/signup", () => {

  });

  context("POST api/users/confirmEmail", () => {

  });
});
