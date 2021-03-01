const sinon = require("sinon");
const fs = require("fs");
const { readFile, writeFile, createDirectory } = require("../utils/file-utlis");

describe("File Utilities", () => {
  let readFileSync;
  let writeFileSync;
  let mkdirSync;
  beforeEach(() => {
    readFileSync = sinon.stub(fs, "readFileSync").returns({});
    writeFileSync = sinon.stub(fs, "writeFileSync").returns({});
    mkdirSync = sinon.stub(fs, "mkdirSync").returns({});
  });
  afterEach(() => {
    readFileSync.restore();
    writeFileSync.restore();
    mkdirSync.restore();
  });
  it("should read component files based on directory", () => {
    readFile("dummyPath");
    expect(
      readFileSync.calledOnceWith("dummyPath", { encoding: "utf-8" })
    ).toBe(true);
  });
  it("should write contents to given file path", () => {
    const spy = jest.spyOn(fs, "writeFileSync");
    writeFile("dummyPath", "ABCD");
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("should create a directory", () => {
    const spy = jest.spyOn(fs, "mkdirSync");
    createDirectory("dummyPath");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
