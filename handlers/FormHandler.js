class FormHandler {
  constructor(page, formLocator = null) {
    if (!page) {
      throw new Error("FormHandler requires a Playwright page instance.");
    }

    this.page = page;
    this.formLocator = formLocator || page.locator("form");
  }

  async fillForm(customValues = [], options = {}) {
    await this.#validateForm();

    const { fillOptionalFields = true } = options;

    const controls = this.formLocator.locator("input, select");

    const controlsCount = await controls.count();
    const usedCustomValues = new Set();

    for (let index = 0; index < controlsCount; index++) {
      const control = controls.nth(index);

      const tagName = await control.evaluate((element) =>
        element.tagName.toLowerCase(),
      );

      const id = await control.getAttribute("id");

      const type =
        tagName === "input"
          ? ((await control.getAttribute("type")) || "text").toLowerCase()
          : null;

      const required = (await control.getAttribute("required")) !== null;

      const readOnly = (await control.getAttribute("readonly")) !== null;

      const disabled = await control.isDisabled();

      if (disabled || readOnly) {
        continue;
      }

      const unsupportedInputTypes = [
        "hidden",
        "submit",
        "button",
        "reset",
        "file",
        "image",
      ];

      if (tagName === "input" && unsupportedInputTypes.includes(type)) {
        continue;
      }

      const customValue = customValues.find((item) => item.id === id);

      if (customValue) {
        usedCustomValues.add(customValue.id);

        if (tagName === "select") {
          await control.selectOption({
            label: String(customValue.value),
          });
        } else {
          await control.fill(String(customValue.value));
        }

        continue;
      }

      if (!required && !fillOptionalFields) {
        continue;
      }

      if (tagName === "select") {
        const options = await control
          .locator("option")
          .evaluateAll((optionElements) =>
            optionElements.map((option) => ({
              text: option.textContent.trim(),
              value: option.value,
              disabled: option.disabled,
            })),
          );

        const availableOptions = options.filter((option) => !option.disabled);

        if (availableOptions.length === 0) {
          throw new Error(
            `No enabled options were found for select element "${id || "unknown"}".`,
          );
        }

        const selectedOption = required
          ? availableOptions.find((option) => option.value !== "")
          : availableOptions[0];

        if (!selectedOption) {
          throw new Error(
            `No valid option was found for select element "${id || "unknown"}".`,
          );
        }

        await control.selectOption({
          label: selectedOption.text,
        });

        continue;
      }

      await control.fill(this.#generateValue(type));
    }

    const unusedCustomValues = customValues.filter(
      (customValue) => !usedCustomValues.has(customValue.id),
    );

    if (unusedCustomValues.length > 0) {
      const ids = unusedCustomValues
        .map((customValue) => customValue.id)
        .join(", ");

      throw new Error(
        `The following custom value IDs were not found inside the form: ${ids}`,
      );
    }
  }

  async submitForm(submitLocator = null) {
    await this.#validateForm();

    if (submitLocator) {
      const submitCount = await submitLocator.count();

      if (submitCount === 0) {
        throw new Error(
          "The provided submit locator did not match any element.",
        );
      }

      if (submitCount > 1) {
        throw new Error(
          "The provided submit locator matched more than one element.",
        );
      }

      await submitLocator.click();
      return;
    }

    const submitLocatorFallback = this.formLocator.locator(
      'button[type="submit"], button:not([type]), input[type="submit"]',
    );

    const submitCount = await submitLocatorFallback.count();

    if (submitCount === 0) {
      throw new Error("No submit control was found inside the form.");
    }

    if (submitCount > 1) {
      throw new Error(
        "More than one submit control was found. Provide a specific submit locator.",
      );
    }

    await submitLocatorFallback.click();
  }

  async #validateForm() {
    const formCount = await this.formLocator.count();

    if (formCount === 0) {
      throw new Error("No form element was found.");
    }

    if (formCount > 1) {
      throw new Error(
        "More than one form was found. Provide a specific form locator.",
      );
    }
  }

  #generateValue(type) {
    switch (type) {
      case "email":
        return `${this.#randomLetters(8)}@test.com`;

      case "url":
        return `https://${this.#randomLetters(8)}.com`;

      case "tel":
        return `05${this.#randomNumbers(8)}`;

      case "text":
      default:
        return this.#randomLetters(10);
    }
  }

  #randomLetters(length) {
    const characters = "abcdefghijklmnopqrstuvwxyz";

    return Array.from(
      { length },
      () => characters[Math.floor(Math.random() * characters.length)],
    ).join("");
  }

  #randomNumbers(length) {
    const characters = "0123456789";

    return Array.from(
      { length },
      () => characters[Math.floor(Math.random() * characters.length)],
    ).join("");
  }
}

module.exports = {
  FormHandler,
};
