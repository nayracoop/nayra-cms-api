const { expect, assert }  = require("chai");
const sandbox = require("sinon").createSandbox();
const { program } = require("../commands/commands");
const fs = require("fs");
const chance = require("chance").Chance();
const ResourceHelper = require("../lib/resourceHelpers");

let consoleSpy = null;
let stubDir = null;
let stubFiles = null;

describe("test CLI commands", () => {
  beforeEach(() =>{
    stubFiles = sandbox.stub(fs, "writeFileSync").returns(true);
    stubDir = sandbox.stub(fs, "mkdirSync").returns(true);
    consoleSpy = sandbox.spy(console, "error");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it.skip("should display an error message if the resouce name is not given", () => {
    const argv = [
      process.argv[0],
      process.argv[1],
      "add-resource"
    ];
    program.parse(argv);
    const errMsg = "ERROR: `add-resource` command requires to be provided a resource name";
    assert(consoleSpy.withArgs(errMsg).calledOnce, "wrong error message");
  });

  it("should call the createFoldersAndFiles method", () => {
    const spyCreateResource = sandbox.stub(ResourceHelper, "createFoldersAndFiles").returns(true);
    const argv = [
      process.argv[0],
      process.argv[1],
      "add-resource",
      chance.word()
    ];
    program.parse(argv);
    
    assert(spyCreateResource.calledOnce, "createFoldersAndFiles() not called or called more than once");
  });
});
