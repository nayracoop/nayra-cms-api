const { expect, assert }  = require("chai");
const sandbox = require("sinon").createSandbox();
const fs = require("fs");
const chance = require("chance").Chance();
const { program } = require("../commands/commands");
const ResourceHelper = require("../commands/resourceHelpers");

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

  it("should call the addNewResource method", () => {
    const spyCreateResource = sandbox.stub(ResourceHelper, "addNewResource").returns(true);
    const argv = [
      process.argv[0],
      process.argv[1],
      "add-resource",
      chance.word()
    ];
    program.parse(argv);
    
    assert(spyCreateResource.calledOnce, "addNewResource() not called or called more than once");
  });
});
