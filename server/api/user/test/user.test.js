const { expect, assert } = require("chai");
const request = require("supertest");
const fixtures = require('node-mongoose-fixtures');
const crypto = require("crypto");
const { Types } = require("mongoose");


require("dotenv").config();

const app = require("../../../server");

describe("User", () => {
  // for test purposes, all passwords are '123456'
  const password = "123456"

  before(() => {
    
    const salt = crypto.randomBytes(16).toString("hex");

    fixtures({
      User: [
          {
            accountId: Types.ObjectId(),
            username: 'username1', 
            email: 'username1@nayra.coop',
            emailConfirmed: true,
            hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
            salt
          },
          {
            accountId: Types.ObjectId(),
            username: 'username2', 
            email: 'username2@nayra.coop',
            emailConfirmed: true,
            hash: crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex"),
            salt
          }
      ]
    }, (err, _data) => {
      if (err) {
        console.error(err);
      }
    });
    
  });
  // beforeEach();
  // afterEach();
  after(() => {
    fixtures.reset();
  });

  it("should pass", (done) => {
    expect(true).to.eql(true);

    request(app)
      .post('/api/login')
      .send({username: "username1", password}) // x-www-form-urlencoded upload
      .expect(200)
      .then(response => {
        done();
    })
  });
});