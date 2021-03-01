const { createProject } = require("../cmds/theme_cmds/init");
const {
  validateThemeAndGroupName,
  validateAppIdAndToken
} = require("../utils/validation-utils");
const { loginUserWithEmail } = require("../utils/utils");
const sinon = require("sinon");
const nock = require("nock");
const { platform } = require("../apis/apiUrl");

describe("Validate theme and group name", () => {
  it("should validate theme and group name", () => {
    let themename = "demo-theme";
    let groupname = "demo-group";

    expect(validateThemeAndGroupName(themename, groupname)).toEqual(true);
  });
  it("invalid theme and group name", () => {
    expect(validateThemeAndGroupName).toThrow();
  });
});

describe("Validate App ID and Token", () => {
  it("invalid app id or token", async () => {
    let appId = "123456789";
    let token = "123-123-123";
    await expect(validateAppIdAndToken(appId, token)).rejects.toThrow();
  });
});

describe("Validate Email ID and password", () => {
  it("should validate email id and password", async () => {
    const email = "test@test.com";
    const password = "password";
    const loginUser = jest.fn();
    const storeCookie = jest.fn();
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
    await expect(loginUserWithEmail(email, password)).rejects.toThrow();
  });
});

describe("Validate App Domain and Token", () => {
  it("should validate domain and token", async () => {
    const domain = "test.domain.com";
    const token = "token";
    let appAPI = require("../apis/app");
    nock(platform)
      .get("/search-application?query=test.domain.com")
      .reply(200, {
        application: {
          "app-id": "123456",
          token: "token"
        }
      });
  });
});

describe("Create Project", () => {
  it("should fail creating project", async () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
    await createProject({});
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
