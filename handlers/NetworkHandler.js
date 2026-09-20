const { expect } = require("@playwright/test");

class NetworkHandler {
  constructor(page) {
    if (!page) {
      throw new Error("NetworkHandler requires a Playwright page instance.");
    }

    this.page = page;
  }

  async waitForResponse(predicate, callbackFn, expectations = {}) {
    if (typeof predicate !== "function") {
      throw new Error("NetworkHandler requires a response predicate function.");
    }

    if (typeof callbackFn !== "function") {
      throw new Error("NetworkHandler requires a callback function.");
    }

    /*
     * Start waiting before executing the action that triggers
     * the request, preventing a race condition where the
     * response could arrive before the listener is active.
     */
    const responsePromise = this.page.waitForResponse(predicate);

    await callbackFn();

    const response = await responsePromise;

    this.#validateResponse(response, expectations);

    return response;
  }

  #validateResponse(response, expectations) {
    if (Object.prototype.hasOwnProperty.call(expectations, "method")) {
      const expectedMethod = String(expectations.method).toUpperCase();

      expect(
        response.request().method(),
        `Expected request method to be ${expectedMethod}`,
      ).toBe(expectedMethod);
    }

    if (Object.prototype.hasOwnProperty.call(expectations, "status")) {
      expect(
        response.status(),
        `Expected response status to be ${expectations.status}`,
      ).toBe(expectations.status);
    }
  }
}

module.exports = {
  NetworkHandler,
};
