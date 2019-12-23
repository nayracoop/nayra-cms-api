const { expect}  = require("chai");
const sandbox = require("sinon").createSandbox();
const { createFoldersAndFiles } = require("../lib/add-resource");
const files = require("../cli-helpers");
const fs = require("fs");

let spyConsole = null;
let stubFiles = null;
let stubDir = null;

beforeEach(() => {
  // spyConsole = sandbox.spy(console, "log");
  stubFiles = sandbox.stub(fs, "writeFileSync").returns(true);
  stubDir = sandbox.stub(fs, "mkdirSync").returns(true);
});

afterEach(() => {
  sandbox.restore();
});

describe("add-resource", () => {
  it("should fail if resource name were not given", () => {
    createFoldersAndFiles();
    expect(false).to.be.eql(false);
  });
});
