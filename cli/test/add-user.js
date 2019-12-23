const { expect}  = require("chai");
const sandbox = require("sinon").createSandbox();
const { addUser } = require("../lib/add-user");
// const { expect } = chai.expect;
let spyConsole = null;

beforeEach(() => {
  spyConsole = sandbox.spy(console, "log");
});

afterEach(() => {
  sandbox.restore();
});

describe("add-resource", () => {
  it("should fail if resource name were not given", () => {
    addUser();
    expect(console.log.calledOnce).to.be.eql(true);
  });
});
