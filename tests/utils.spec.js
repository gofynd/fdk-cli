const {
  generateConfigJSON,
  storeCookie,
  readCookie
} = require("../utils/utils");
const fs = require("fs");
const sinon = require("sinon");
describe("Utilities", () => {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });
  it("should generate config.json", () => {
    const configObj = {
      test: "test"
    };
    let fileUtils = require("../utils/file-utlis");
    sandbox.stub(fileUtils, "writeFile").returns("");
    sandbox.stub(fs, "writeFileSync").returns({});
    expect(generateConfigJSON(configObj)).toEqual(configObj);
  });
  it("should store cookie", () => {
    const cookie = "cookie";
    const themeName = "theme";
    let fileUtils = require("../utils/file-utlis");
    sandbox.stub(fileUtils, "createDirectory").returns({});
    sandbox.stub(fileUtils, "writeFile").returns("");
    sandbox.stub(fs, "writeFileSync").returns({});
    sandbox.stub(fs, "mkdirSync").returns({});
    expect(storeCookie(cookie, themeName)).toEqual(true);
  });
  it("should read cookie", () => {
    const cookie = "cookie";
    let fileUtils = require("../utils/file-utlis");
    sandbox.stub(fileUtils, "readFile").returns(cookie);
    sandbox.stub(fs, "readFileSync").returns(cookie);
    expect(readCookie()).toEqual(cookie);
  });
});

describe("Theme Command", () => {
  it("should validate command name", () => {
    const { command, desc } = require("../cmds/theme");
    expect(command).toEqual("theme <command>");
    expect(desc).toEqual("Theme Module of FDK");
  });
});
