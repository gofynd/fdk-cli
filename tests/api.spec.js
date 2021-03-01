const axios = require("axios");
const { getApp } = require("../apis/app");
const { sendTheme } = require("../apis/theme");
const { loginUser } = require("../apis/user");
const { sligshot, platform, grimlock } = require("../apis/apiUrl");
const { appResponse, themeResponse } = require("./utils/response");
jest.mock("axios");

describe("API Testing", () => {
  it("should validate app id and token", async () => {
    let mockResponse = appResponse;
    let appId = "1234567890qwerty";
    let appToken = "dummy-token";
    axios.post.mockImplementation(() => {
      return Promise.resolve(mockResponse);
    });
    const spy = jest.spyOn(axios, "get");
    await getApp(appId, appToken);
    expect(spy).toHaveBeenCalledWith(
      `${sligshot}/application/current?app-id=${appId}&app-token=${appToken}`
    );
  });
  it("should validate app id and token", async () => {
    let mockResponse = appResponse;
    let appDomain = "test.com";
    axios.post.mockImplementation(() => {
      return Promise.resolve(mockResponse);
    });
    const spy = jest.spyOn(axios, "get");
    expect(spy).toHaveBeenCalledWith(
      `${platform}/search-application?query=${appDomain}`,
      {
        auth: {
          password: "slingsh0t@ppt0ken#fynd",
          username: "slingshotapptoken"
        }
      }
    );
  });
  it("should send theme to db", async () => {
    let mockResponse = themeResponse;
    const data = {
      application: "appid",
      token: "dummy-token",
      Cookie: "dummy-cookie"
    };
    axios.post.mockImplementation(() => {
      return Promise.resolve(mockResponse);
    });
    const spy = jest.spyOn(axios, "put");
    await sendTheme(data);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("should login user", async () => {
    const mockResponse = {};

    const data = {
      "g-recaptcha-response": "_skip_",
      password: "password",
      username: "test@gofynd.com"
    };
    const headers = { "Content-Type": "application/json" };
    axios.post.mockImplementation(() => {
      return Promise.resolve(mockResponse);
    });
    const spy = jest.spyOn(axios, "post");
    const res = await loginUser(data.username, data.password);
    expect(spy).toHaveBeenCalledWith(
      `${grimlock}/password-login`,
      data,
      headers
    );
  });
});
