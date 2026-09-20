const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",

  retries: 0,

  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
      },
    ],
  ],

  use: {
    screenshot: "on",
    trace: "on",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
