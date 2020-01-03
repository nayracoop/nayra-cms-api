const { expect, assert}  = require("chai");
const sandbox = require("sinon").createSandbox();
const { createFoldersAndFiles } = require("../lib/resourceHelpers");
const files = require("../lib/files");
const fs = require("fs");
const chance = require("chance").Chance();

let spyConsole = null;
let stubFiles = null;
let stubDir = null;

const resourceFolders = [
  "controller", "dao", "model", "routes", "tests"
];

describe("add-resource", () => {
  beforeEach(() => {
    spyConsole = sandbox.spy(console, "log");
    stubFiles = sandbox.stub(fs, "writeFileSync").returns(true);
    stubDir = sandbox.stub(fs, "mkdirSync").returns(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should create a resource scaffold with the given name", () => {
    const name = chance.word();
    createFoldersAndFiles(name);
    //  resource folder and modules: "controller", "dao", "model", "routes", "tests"
    expect(stubDir.callCount).to.be.eql(6);
    expect(stubDir.firstCall.args[0]).to.be.eql(`../server/api/${name}`);

    // resource sub folders
    for (let i = 0; i < resourceFolders.length; i++) {
      expect(stubDir.getCall(i + 1).args[0]).to.be.eql(`../server/api/${name}/${resourceFolders[i]}`);
      expect(stubFiles.getCall(i).args[0]).to.be.eql(`../server/api/${name}/${resourceFolders[i]}/${name}-${resourceFolders[i]}.js`);
    }

    assert(spyConsole.withArgs(`Creating api resources for: ${name}`).calledOnce);
    assert(spyConsole.withArgs(`created new folder ../server/api/${name}`).calledOnce);
  });
});
