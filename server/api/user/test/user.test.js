const { expect, assert } = require("chai");
const request = require("supertest");
const fixtures = require("node-mongoose-fixtures");
const crypto = require("crypto");
const { Types } = require("mongoose");
const jwt = require("jsonwebtoken");

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
];

describe("User", () => {
  // for test purposes, all passwords are '123456'
  before(() => {
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
    // happy case : login, return 200, and return { ??? }
    // wrong password : return 401, return x error, add a failed login attempt
    // wrong password many times ? :
    // unexisting username : 401 , return x error
    // username || password not a string , return x error, (now returns 500 and internal server error)

    it("should login and return a token if a existing username and password are provided", (done) => {
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

    it("should return an error if the provided password is wrong and add a failed login attempt into the user", (done) => {
      request(app)
        .post("/api/login")
        .send({ username: "username1", password: "wrong password" })
        .expect("Content-Type", /json/)
        .expect(401)
        .then((res) => {
          expect(res.body.name).to.eql("AuthenticationError");
          expect(res.body.code).to.eql(1); // incrrect user or password
          expect(res.body.message).to.eql("Not authenticated.");

          // TO-DO check failed login attempts length is 1
          // const users = fixtures.get("users").User;
          // const user = users.find(u => u.username === "username1");
          // console.log(user.failedLoginAttempts);
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
    // let token = null;
    // beforeEach((done) => {
    //   request(app)
    //     .post("/api/login")
    //     .send({ username: "username1", password })
    //     .end((err, { body }) => {
    //       token = body.token;
    //       done();
    //     });
    // });

    // happy case : create succesfully, return 201, and return { ??? }
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
          // TODO define exactly which properties we need for user
          expect(res.body).to.include.keys(["_id", "username", "email", "accountId", "url", "deleted",
            "emailConfirmed", "firstName", "lastName"]);

          expect(res.body).to.not.have.property(["hash", "salt"]);

          expect(res.body.username).to.eql(newUser.username);
          expect(res.body.email).to.eql(newUser.email);
          expect(res.body.firstName).to.eql(newUser.firstName);
          expect(res.body.lastName).to.eql(newUser.lastName);
          done();
        })
        .catch(done);
    });

    // should create salt and hash from password
    // no password : return return x error
    // req.body is not an object : return return x error
    // req.user is not an object (middleware error, jwt token user not valid)
    // username || password not a string , return x error, (now returns 500 and internal server error)
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
