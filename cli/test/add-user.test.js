require("dotenv").config();
const { expect, assert }  = require("chai");
const sandbox = require("sinon");
const { addUser } = require("../commands/add-user");

let spyConsole = null;

describe("add-user", () => {
  beforeEach(() => {
    spyConsole = sandbox.spy(console, "log");
  });

  afterEach(() => {
    spyConsole.restore();
  });

  it.skip("should call the console log", () => {
    addUser();
    expect(spyConsole.calledOnce).to.be.eql(true);
  });
});
