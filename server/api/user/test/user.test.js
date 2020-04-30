const { expect, assert } = require("chai");
const request = require("supertest");
const fixtures = require("node-mongoose-fixtures");
const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

let UserModel = null;
let token = null;
const password = "123456";
const salt = crypto.randomBytes(16).toString("hex");
const testAccountId = mongoose.Types.ObjectId();
const adminId = mongoose.Types.ObjectId();
const userFromOtherAccountId = mongoose.Types.ObjectId();


require("dotenv").config();

// consider to use a secret for tests?
const { JWT_SECRET } = process.env;
const app = require("../../../server");

const users = [
  {
    _id: adminId,
    accountId: testAccountId,
    username: "username1",
    email: "username1@nayra.coop",
    emailConfirmed: true,
    hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
    salt,
    updated: []
  },
  {
    accountId: testAccountId,
    username: "username2",
    email: "username2@nayra.coop",
    emailConfirmed: true,
    hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
    salt,
    updated: []
  },
  {
    accountId: testAccountId,
    username: "username3",
    email: "username3@nayra.coop",
    emailConfirmed: true,
    hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
    salt,
    updated: []
  },
  {
    _id: userFromOtherAccountId,
    accountId: mongoose.Types.ObjectId(),
    username: "userFromOtherAccount",
    email: "mariana@notnayra.coop",
    emailConfirmed: true,
    hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
    salt,
    updated: []
  }
];

// users from nayra account
const usersCount = users.length - 1;

// validate responses
const fieldsToInclude = ["_id", "username", "email", "accountId", "url", "emailConfirmed", "id", "__v"];
const fieldsToExclude = ["hash", "salt", "deleted", "deletedAt"];
const responseExpect = (entity, include, notInclude) => {
  expect(entity).to.have.keys(...include);
  expect(entity).to.not.have.any.keys(...notInclude);
};

describe("User endpoints", () => {
  // for test purposes, all passwords are '123456'
  before(() => {
    fixtures.reset();
    UserModel = mongoose.model("User");
  });

  beforeEach((done) => {
    token = jwt.sign(users[0], JWT_SECRET);

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
          assert(res.body.token, "body response should contain a token");
          assert(res.body.user, "body response should contain a user object");
          responseExpect(res.body.user, [...fieldsToInclude, "updated"], fieldsToExclude);
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
          expect(res.body.message).to.eql("Not authenticated.");

          done();
        })
        .catch(done);
    });

    // TO-DO en vez de tirar esto deberia tirar TYPEERROR en el DAO
    it("should return 422 if the provided username is not a string", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: ["hey", "notAstring"], password })
        .expect("Content-Type", /json/)
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.message).to.eql("username or password are not a string or missing");
          done();
        })
        .catch(done);
    });

    it("should return 422 if the provided password is not a string", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "username1", password: ["hey", "notAstring"] })
        .expect("Content-Type", /json/)
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.message).to.eql("username or password are not a string or missing");
          done();
        })
        .catch(done);
    });
  });

  context("GET api/users  (get all)", () => {
    it("should return an object with all users from same account", (done) => {
      request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          expect(res.body).to.include.keys(["count", "list"]);
          expect(res.body.count).to.be.eql(usersCount);
          
          expect(res.body.list.length).to.be.eql(usersCount);
          res.body.list.forEach((user) => {
            responseExpect(user, fieldsToInclude, fieldsToExclude);
          });
          // maybe should check if id of response are contained in users fixtures
          done();
        })
        .catch(done);
    });

    it("should return a paged list of users from same account", (done) => {
      // count should give the total number of entries beyond the paged result
      const perPage = 2;
      request(app)
        .get("/api/users")
        .query({ perPage })
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          expect(res.body).to.include.keys(["count", "list"]);
          expect(res.body.count).to.be.eql(usersCount);
          expect(res.body.list.length).to.be.eql(perPage);
          res.body.list.forEach((user) => {
            responseExpect(user, fieldsToInclude, fieldsToExclude);
          });
          done();
        })
        .catch(done);
    });

    it("should filter users by username query param", (done) => {
      request(app)
        .get("/api/users")
        .query({ username: "ame1" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          expect(res.body).to.include.keys(["count", "list"]);
          expect(res.body.count).to.be.eql(1);
          expect(res.body.list.length).to.be.eql(1);
          expect(res.body.list[0].username).to.be.eql(users[0].username);
          done();
        })
        .catch(done);
    });

    it("should return accept a boolean query param", (done) => {
      request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .query({ emailConfirmed: "true" })
        .expect(200)
        .then((res) => {
          expect(res.body).to.include.keys(["count", "list"]);
          expect(res.body.count).to.be.eql(usersCount);
          // be carefull someday pagination could change this
          expect(res.body.list.length).to.be.eql(usersCount);
          // maybe should check if id of response are contained in users fixtures
          done();
        })
        .catch(done);
    });

    it("should not accept a bad boolean string in query param", (done) => {
      request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .query({ emailConfirmed: "gatito" })
        .expect(422)
        .then((res) => {
          expect(res.body).to.include.keys(["code", "name", "message"]);
          expect(res.body.message).to.be.eql("emailConfirmed must be a boolean");
          expect(res.body.name).to.be.eql("ValidationError");
          done();
        })
        .catch(done);
    });

    it("should return a 422 error if query contain forbidden params", (done) => {
      request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .query({ username: "user", hash: "should not accept the hash" })
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
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
        email: "new@user.com",
        firstName: "New",
        lastName: "User"
      };

      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send(newUser)
        .expect(201)
        .then((res) => {
          expect(res.body).to.include.keys(["_id", "username", "email", "accountId", "url",
            "emailConfirmed", "firstName", "lastName"]);
          expect(res.body).to.not.have.any.keys("hash", "salt", "password", "deleted", "deletedAt");
          expect(res.body.username).to.eql(newUser.username);
          expect(res.body.email).to.eql(newUser.email);
          expect(res.body.firstName).to.eql(newUser.firstName);
          expect(res.body.lastName).to.eql(newUser.lastName);
          done();
        })
        .catch(done);
    });

    it("should create a salt and a hash from the password", (done) => {
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
        .then(() => UserModel.findOne({ username: newUser.username }))
        .then((user) => {
          expect(user.salt).to.be.a("string");
          expect(user.hash).to.be.a("string");
          expect(user.hash).to.eql(crypto.pbkdf2Sync(newUser.password, user.salt, 1000, 64, "sha512").toString("hex"));
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
          expect(res.body.message).to.eql("Created user must have a password");
          done();
        })
        .catch(done);
    });

    it("should return an error if username is not a string", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: [], password: "secret", email: "usern@mail.com" })
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.message).to.eql("Username must be a string");
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
          expect(res.body.message).to.eql("Email is wrong");
          done();
        })
        .catch(done);
    });

    it("should return an error if password is not a string", (done) => {
      request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "username", password: [], email: "user@name.com" })
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.message).to.eql("Password must be a string");
          done();
        })
        .catch(done);
    });

    it("should return an error if unvalid token is provided", (done) => {
      const expectedError = {
        error: {
          code: "INVALID_AUTHORIZATION_CODE",
          message: "Invalid authorization code"
        }
      };

      request(app)
        .post("/api/users")
        .set("Authorization", "Bearer not a token")
        .send({ username: "hello", password: "newuser" })
        .expect(401)
        .then((res) => {
          expect(res.body).to.eql(expectedError);
          done();
        })
        .catch(done);
    });
  });

  context("GET api/users/:id  (get by Id)", () => {
    it("should get user by id", (done) => {
      request(app)
        .get(`/api/users/${adminId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          expect(res.body.id).to.eql(adminId.toString());
          expect(res.body.accountId).to.eql(testAccountId.toString());
          responseExpect(res.body, [...fieldsToInclude, "updated"], fieldsToExclude);
          done();
        })
        .catch(done);
    });

    it("should not get user from another account", (done) => {
      const expectedError = {
        name: "NotFoundError",
        code: 404,
        message: `The requested Users member with id ${userFromOtherAccountId} does not exist or does not belong to your account.`
      };

      request(app)
        .get(`/api/users/${userFromOtherAccountId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404)
        .then((res) => {
          expect(res.body).to.eql(expectedError);
          done();
        })
        .catch(done);
    });

    it("should throw an error if the provided id doesn't belong to an existing record", (done) => {
      const invalidId = mongoose.Types.ObjectId();
      const expectedError = {
        name: "NotFoundError",
        code: 404,
        message: `The requested Users member with id ${invalidId} does not exist or does not belong to your account.`
      };

      request(app)
        .get(`/api/users/${invalidId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404)
        .then((res) => {
          expect(res.body).to.eql(expectedError);
          done();
        })
        .catch(done);
    });

    it("should throw an error if the provided id is not a valid id", (done) => {
      const expectedError = {
        name: "ValidationError",
        code: 422,
        message: "Id is not a valid ObjectId."
      };

      request(app)
        .get("/api/users/notAnId")
        .set("Authorization", `Bearer ${token}`)
        .expect(422)
        .then((res) => {
          expect(res.body).to.eql(expectedError);
          done();
        })
        .catch(done);
    });

    it("should return an error if unvalid token is provided", (done) => {
      const expectedError = {
        error: {
          code: "INVALID_AUTHORIZATION_CODE",
          message: "Invalid authorization code"
        }
      };

      request(app)
        .get(`/api/users/${adminId}`)
        .set("Authorization", "Bearer not a token")
        .expect(401)
        .then((res) => {
          expect(res.body).to.eql(expectedError);
          done();
        })
        .catch(done);
    });
  });

  context("PUT api/users/:id  (update by Id)", () => {
    const userToUpdateId = mongoose.Types.ObjectId();
    const userFromAnotherAccountId = mongoose.Types.ObjectId();

    beforeEach((done) => {
      fixtures.save("users", {
        User: [
          {
            _id: userToUpdateId,
            accountId: testAccountId,
            username: "test",
            email: "test@nayra.coop",
            emailConfirmed: true,
            hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
            salt
          },
          {
            _id: userFromAnotherAccountId,
            accountId: mongoose.Types.ObjectId(),
            username: "fromOtherAccount",
            email: "fromOtherAccount@nayra.coop",
            emailConfirmed: true,
            hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
            salt
          }
        ]
      });

      fixtures("users", (err, _data) => {
        if (err) {
          console.error("Fixture error", err);
        }
        done();
      });
    });

    it("should update and add updated at field", (done) => {
      request(app)
        .put(`/api/users/${userToUpdateId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ firstName: "Updated!", lastName: "Well done!" })
        .expect(200)
        .then((res) => {
          // response validation
          responseExpect(res.body, [...fieldsToInclude, "updated", "firstName", "lastName"], fieldsToExclude);
          expect(res.body.firstName).to.eql("Updated!");
          expect(res.body.lastName).to.eql("Well done!");
          expect(res.body.updated.length).to.eql(1);
          expect(res.body.updated[0].by).to.eql(adminId.toString());
          return UserModel.findOne({ username: "test" });
        })
        .then((user) => {
          expect(user.firstName).to.eql("Updated!");
          expect(user.lastName).to.eql("Well done!");
          expect(user.updated.length).to.eql(1);
          expect(user.updated[0].by).to.eql(adminId);

          done();
        })
        .catch(done);
    });

    it("should throw an error if a provided field has the wrong type", (done) => {
      request(app)
        .put(`/api/users/${userToUpdateId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ accountId: "Updated!", lastName: "Well done!" })
        .expect(422)
        .then((res) => {
          expect(res.body.message).to.eql("accountId must be a valid ObjectId");
          return UserModel.findOne({ username: "test" });
        })
        .then((user) => {
          // expect no new entries on updated array
          expect(user.updated.length).to.eql(0);
          done();
        })
        .catch(done);
    });

    it("should not add invalid fields", (done) => {
      request(app)
        .put(`/api/users/${userToUpdateId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ coolField: "i want to be in the user too!" })
        .expect(422)
        .then((res) => {
          expect(res.body.message).to.eql("Field `coolField` is not in schema and strict mode is set to throw.");
          return UserModel.findOne({ username: "test" });
        })
        .then((user) => {
          expect(user.coolField).to.eql(undefined);
          // expect no new entries on updated array
          expect(user.updated.length).to.eql(0);
          done();
        })
        .catch(done);
    });

    it("should not be able to update a user record from another account", (done) => {
      request(app)
        .put(`/api/users/${userFromAnotherAccountId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ firstName: "Updated!", lastName: "Well done!" })
        .expect(404)
        .then((res) => {
          expect(res.body.name).to.eql("NotFoundError");
          expect(res.body.message).to.eql(`The requested Users member with id ${userFromAnotherAccountId} does not exist or does not belong to your account.`);

          return UserModel.findOne({ _id: userFromAnotherAccountId });
        })
        .then((user) => {
          expect(user.updated.length).to.eql(0);
          done();
        })
        .catch(done);
    });

    it("should return an error if unvalid token is provided", (done) => {
      const expectedError = {
        error: {
          code: "INVALID_AUTHORIZATION_CODE",
          message: "Invalid authorization code"
        }
      };

      request(app)
        .put(`/api/users/${userToUpdateId}`)
        .set("Authorization", "Bearer not a token")
        .send({ firstName: "Updated!", lastName: "Well done!" })
        .expect(401)
        .then((res) => {
          expect(res.body).to.eql(expectedError);
          done();
        })
        .catch(done);
    });

    it("should throw an error if the provided id doesn't belong to an existing record", (done) => {
      const invalidId = mongoose.Types.ObjectId();
      const expectedError = {
        name: "NotFoundError",
        code: 404,
        message: `The requested Users member with id ${invalidId} does not exist or does not belong to your account.`
      };

      request(app)
        .put(`/api/users/${invalidId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404)
        .then((res) => {
          expect(res.body).to.eql(expectedError);
          done();
        })
        .catch(done);
    });
  });

  context("DELETE api/users/:id  (remove by Id)", () => {
    const userToDeleteId = mongoose.Types.ObjectId();
    const userFromAnotherAccountId = mongoose.Types.ObjectId();

    beforeEach((done) => {
      fixtures.save("users", {
        User: [
          {
            _id: userToDeleteId,
            accountId: testAccountId,
            username: "test",
            email: "test@nayra.coop",
            emailConfirmed: true,
            hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
            salt
          },
          {
            _id: userFromAnotherAccountId,
            accountId: mongoose.Types.ObjectId(),
            username: "fromOtherAccount",
            email: "fromOtherAccount@nayra.coop",
            emailConfirmed: true,
            hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
            salt
          }
        ]
      });

      fixtures("users", (err, _data) => {
        if (err) {
          console.error("Fixture error", err);
        }
        done();
      });
    });

    it("should delete a user record once and not allow to delete it again", (done) => {
      request(app)
        .delete(`/api/users/${userToDeleteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204)
        .then(() => UserModel.findOne({ username: "test" }))
        .then((user) => {
          expect(user).to.eql(null);
          request(app)
            .delete(`/api/users/${userToDeleteId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404)
            .then((res) => {
              // since the record was deleted, check that it is not possible to delete again
              expect(res.body.name).to.eql("NotFoundError");
              expect(res.body.message).to.eql(`The requested Users member with id ${userToDeleteId} does not exist or does not belong to your account.`);    
              done();
            })
            .catch(done);
        })
        .catch(done);
    });

    it("should delete a user record", (done) => {
      request(app)
        .delete(`/api/users/${userToDeleteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204)
        .then(() => UserModel.findOne({ username: "test" }))
        .then((user) => {
          expect(user).to.eql(null);
          done();
        })
        .catch(done);
    });

    it("should not be able to delete a user record from another account", (done) => {
      request(app)
        .delete(`/api/users/${userFromAnotherAccountId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404)
        .then((res) => {
          expect(res.body.name).to.eql("NotFoundError");
          expect(res.body.message).to.eql(`The requested Users member with id ${userFromAnotherAccountId} does not exist or does not belong to your account.`);

          return UserModel.findOne({ _id: userFromAnotherAccountId });
        })
        .then((user) => {
          expect(user.deleted).to.eql(false);
          done();
        })
        .catch(done);
    });

    it("should return an error if unvalid token is provided", (done) => {
      const expectedError = {
        error: {
          code: "INVALID_AUTHORIZATION_CODE",
          message: "Invalid authorization code"
        }
      };

      request(app)
        .delete(`/api/users/${userToDeleteId}`)
        .set("Authorization", "Bearer not a token")
        .expect(401)
        .then((res) => {
          expect(res.body).to.eql(expectedError);
          done();
        })
        .catch(done);
    });
  });

  context("POST api/users/signup", () => {
    it("should create a new valid user from a provided username, email and password", (done) => {
      request(app)
        .post("/api/users/signup")
        .send({
          username: "newUser",
          email: "newUser@mail.coop",
          password
        })
        .expect("Content-Type", /json/)
        .expect(201)
        .then((res) => {
          expect(res.body.username).to.eql("newUser");
          expect(res.body).to.include.keys(["_id", "username", "email", "accountId", "url",
            "emailConfirmed"]);
          expect(res.body).to.not.have.any.keys("hash", "salt", "deleted", "deletedAt");

          return request(app)
            .post("/api/login")
            .send({ username: "newUser", password })
            .expect(200)
            .then((_res) => {
              expect(_res.body.user.username).to.eql("newUser");
              expect(_res.body.user.email).to.eql("newUser@mail.coop");
              done();
            });
        })
        .catch(done);
    });

    it("should create a salt and a hash from the provided password", (done) => {
      const newUser = {
        username: "newuser",
        password,
        email: "new@user.coop",
        firstName: "New",
        lastName: "User"
      };

      request(app)
        .post("/api/users/signup")
        .set("Authorization", `Bearer ${token}`)
        .send(newUser)
        .expect(201)
        .then(() => UserModel.findOne({ username: newUser.username }))
        .then((user) => {
          expect(user.salt).to.be.a("string");
          expect(user.hash).to.be.a("string");
          expect(user.hash).to.eql(crypto.pbkdf2Sync(newUser.password, user.salt, 1000, 64, "sha512").toString("hex"));
          done();
        })
        .catch(done);
    });

    it("should assign the main accountId (in .env) to the user", (done) => {
      fixtures.save("accounts", {
        Account: [
          {
            _id: mongoose.Types.ObjectId(process.env.ACCOUNT_ID),
            name: "not demo",
            email: "test@test.coop",
            isSuperAdmin: false,
            privateKey: "super secret"
          },
          {
            _id: testAccountId,
            name: "another one",
            email: "test@nayra.coop",
            isSuperAdmin: false,
            privateKey: "super secret"
          }
        ]
      });

      fixtures("accounts", (err, _data) => {
        if (err) {
          console.error("Fixture error", err);
        }
      });

      const fakeAccountId = mongoose.Types.ObjectId();

      request(app)
        .post("/api/users/signup")
        .send({
          username: "newUser",
          email: "newUser@mail.coop",
          password
        })
        .then((res) => {
          expect(res.body.accountId).to.eql(process.env.ACCOUNT_ID);
          done();
        })
        .catch(done);
    });

    it("should return an error if username or email are already taken", (done) => {
      // validate for username
      request(app)
        .post("/api/users/signup")
        .send({
          username: "username1",
          email: "username11111@nayra.coop",
          password
        })
        .expect("Content-Type", /json/)
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("NotAvailableError");
          expect(res.body.code).to.eql(422);
          expect(res.body.message).to.eql("Not available or duplicated field");

          // validating for email
          return request(app)
            .post("/api/users/signup")
            .send({
              username: "username1111",
              email: "username1@nayra.coop",
              password
            })
            .expect(422)
            .then((_res) => {
              expect(_res.body.name).to.eql("NotAvailableError");
              expect(_res.body.code).to.eql(422);
              expect(_res.body.message).to.eql("Not available or duplicated field");
              done();
            });
        })
        .catch(done);
    });

    it("should return an error if accountId is in request body", (done) => {
      request(app)
        .post("/api/users/signup")
        .send({
          username: "username1",
          email: "username11111@nayra.coop",
          password,
          accountId: testAccountId
        })
        .expect("Content-Type", /json/)
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.code).to.eql(422);
          expect(res.body.message).to.eql("accountId field not allowed");
          done();
        })
        .catch(done);
    });

    it("should return an error if emailConfirmed is in request body", (done) => {
      request(app)
        .post("/api/users/signup")
        .send({
          username: "username1",
          email: "username11111@nayra.coop",
          password,
          emailConfirmed: true
        })
        .expect("Content-Type", /json/)
        .expect(422)
        .then((res) => {
          expect(res.body.name).to.eql("ValidationError");
          expect(res.body.code).to.eql(422);
          expect(res.body.message).to.eql("emailConfirmed field not allowed");
          done();
        })
        .catch(done);
    });
  });

  context("POST api/users/confirmEmail", () => {
  });
});
