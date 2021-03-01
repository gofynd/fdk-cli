const sinon = require("sinon");
const fs = require("fs");
const fileUtils = require("../utils/file-utlis");
const { platform } = require("../apis/apiUrl");
const nock = require("nock");
describe("Sync Theme Tests", () => {
  it("should send template files to DB", async () => {
    const { sendThemeToDB } = require("../cmds/theme_cmds/sync");
    const themeOptions = {
      _id: "123",
      name: "demo",
      token: "123",
      Cookie: "cookie",
      application: "123"
    };
    nock(platform)
      .put("/application/current/theme")
      .reply(200, {
        themeOptions
      });

    expect(await sendThemeToDB(themeOptions)).toEqual({ themeOptions });
  });
});
