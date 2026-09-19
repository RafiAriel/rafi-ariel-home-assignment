const { test, expect } = require("@playwright/test");

test("Hello World", async ({ page }) => {
  await page.goto("https://example.com");

  console.log("Hello World");

  await expect(page).toHaveTitle(/Example Domain/);
});
