const syncLive = require("../cmds/theme_cmds/sync-live");
const { Observer } = require("../utils/fileWatcher");
jest.mock("../utils/fileWatcher");
describe("Sync-Live", () => {
  beforeEach(() => {
    Observer.mockClear();
  });
  it("should watch folder for changes", () => {
    expect(syncLive.command).toBe("sync-live");
    expect(syncLive.desc).toBe("Sync Live with DB");
    syncLive.handler();
    expect(Observer).toHaveBeenCalledTimes(1);
  });
});
