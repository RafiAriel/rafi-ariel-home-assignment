const { test, expect } = require("@playwright/test");

const { FormHandler } = require("../../handlers/FormHandler");

const { NetworkHandler } = require("../../handlers/NetworkHandler");

const { baseUrl, screenshotPath, successMessage } = require("./config");

test.describe("Contact Us form", () => {
  test("should successfully submit the contact form", async ({ page }) => {
    const formLocator = page.locator('form[action="thank-you.html"]');

    const formHandler = new FormHandler(page, formLocator);

    const networkHandler = new NetworkHandler(page);

    /*
     * The submit button is scoped to the form and located
     * by its visible text because it provides a strong,
     * user-facing identifier for this action.
     */
    const submitButton = formLocator.getByRole("button", {
      name: "Request a call back",
      exact: true,
    });

    const employeesSelect = formLocator.locator("#employees");

    const customValues = [
      {
        id: "employees",
        value: "51-500",
      },
    ];

    let submitResponse;

    await test.step("Open page", async () => {
      try {
        await page.goto(baseUrl);

        await expect(
          page,
          `Expected the browser to navigate to ${baseUrl}`,
        ).toHaveURL(baseUrl);
      } catch (error) {
        console.error("Open page step failed:", error);

        throw error;
      }
    });

    await test.step("Fill form", async () => {
      try {
        await formHandler.fillForm(customValues);
      } catch (error) {
        console.error("Fill form step failed:", error);

        throw error;
      }
    });

    await test.step("Select employees", async () => {
      try {
        /*
         * The employees value is selected dynamically
         * by FormHandler using the custom value passed
         * to fillForm().
         */
        await expect(
          employeesSelect,
          "Expected Number of Employees to be changed to 51-500",
        ).toHaveValue("51-500");
      } catch (error) {
        console.error("Select employees step failed:", error);

        throw error;
      }
    });

    await test.step("Take screenshot", async () => {
      try {
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
      } catch (error) {
        console.error("Take screenshot step failed:", error);

        throw error;
      }
    });

    await test.step("Submit form", async () => {
      try {
        submitResponse = await networkHandler.waitForResponse(
          (response) => response.url().includes("/thank-you.html"),

          () => formHandler.submitForm(submitButton),

          {
            method: "GET",
            status: 200,
          },
        );
      } catch (error) {
        console.error("Submit form step failed:", error);

        throw error;
      }
    });

    await test.step("Verify response", async () => {
      try {
        expect(
          submitResponse,
          "Expected the form submission to return a response",
        ).toBeTruthy();

        expect(
          submitResponse.url(),
          "Expected the form submission response URL to point to the Thank You page",
        ).toContain("/thank-you.html");
      } catch (error) {
        console.error("Verify response step failed:", error);

        throw error;
      }
    });

    await test.step("Verify thank you page", async () => {
      try {
        const thankYouTitle = page.getByRole("heading", {
          level: 1,
          name: "Thank You!",
          exact: true,
        });

        await expect(
          page,
          "Expected to navigate to the Thank You page after submitting the form",
        ).toHaveURL(/thank-you\.html/);

        await expect(
          thankYouTitle,
          "Expected the Thank You heading to exist in the DOM",
        ).toBeAttached();

        await expect(
          thankYouTitle,
          "Expected the Thank You heading to be visible",
        ).toBeVisible();

        await expect(
          thankYouTitle,
          "Expected the Thank You heading to contain the correct text",
        ).toHaveText("Thank You!");

        console.log(successMessage);

        await page.evaluate((message) => {
          console.log(message);
        }, successMessage);
      } catch (error) {
        console.error("Verify thank you page step failed:", error);

        throw error;
      }
    });
  });
});
