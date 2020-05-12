const { expect, assert } = require("chai");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fixtures = require("node-mongoose-fixtures");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { hasPermissions } = require("../check-permissions");

require("dotenv").config();
const app = require("../../server");
// consider to use a secret for tests?
const { JWT_SECRET } = process.env;
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
    salt,
    permissions: ["destroyTheInternet"]
  }
];

describe("checkPermissions middleware", () => {
  afterEach(() => {
    fixtures.reset();
  });

  beforeEach(() => {
    
    fixtures.save("users", {
      User: users
    });
    fixtures("users", (err, _data) => {
      if (err) {
        console.error("Fixture error", err);
      }
    });
  });

  // this integration test relays in an existent route that at the moment of writing its
  // calling this middleware
  it("should throw PermissionError if user has no assigned permissions", (done) => {
    const token = jwt.sign(users[0], JWT_SECRET);
    request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(401)
      .then((res) => {
        expect(res.body.name).to.be.eql("PermissionError");
        expect(res.body.message).to.be.eql("User has no assigned permisions");
        done();
      });
  });

  // this integration test relays in an existent route that at the moment of writing its
  // calling this middleware
  it("should throw PermissionError if user has no permissions for the current endpoint", (done) => {
    const token = jwt.sign(users[1], JWT_SECRET);
    request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)
      .then((res) => {
        expect(res.body.name).to.be.eql("PermissionError");
        expect(res.body.message).to.be.eql("User has no sufficient permisions");
        done();
      });
  });

  it("should handle non expected error as Permission Error", (done) => {
    assert(false);
    done();
  });
});

describe("hasPermissions", () => {
  it("should pass if user has sufficient permissions", (done) => {
    // simple permissions
    let result = hasPermissions(["a"], ["a"]);
    assert(result, "Permission logic is failing for a - a");

    result = hasPermissions(["a"], ["b"]);
    assert(!result, "Permission logic is failing for a - b");

    result = hasPermissions("a", ["a"]);
    assert(result, "Permission logic is failing for a (string) - a");

    // AND conditions
    result = hasPermissions(["a", "b"], ["a", "b"]);
    assert(result, "Permission logic is failing for AND sufficient condition");

    result = hasPermissions(["a", "b"], ["b", "c"]);
    assert(!result, "Permission logic is failing for AND insufficient condition");

    result = hasPermissions([["a", "b"]], ["a", "b"]);
    assert(result, "Permission logic is failing for AND sufficient condition - ");

    result = hasPermissions([["a", "b"]], ["b", "c"]);
    assert(!result, "Permission logic is failing for AND insufficient condition");
    
    // OR conditions
    result = hasPermissions([["a"], ["b"]], ["a", "c"]);
    assert(result, "Permission logic is failing for OR sufficient condition");

    result = hasPermissions([["a"], ["d"]], ["b", "c"]);
    assert(!result, "Permission logic is failing for OR insufficient condition");

    // AND - OR Conditions
    result = hasPermissions([["a"], ["c", "b"]], ["a", "d"]);
    assert(result, "Permission logic is failing for AND/OR sufficient condition");

    result = hasPermissions([["a", "b"], ["c", "d"]], ["b", "c"]);
    assert(!result, "Permission logic is failing for AND/OR insufficient condition");

    done();
  });
});
