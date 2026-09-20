# Playwright Home Assignment

Automation project implemented with Playwright Test and JavaScript.

## Requirements

- Node.js
- Yarn

## Installation

Install project dependencies:

```bash
yarn install
```

Install Chromium for Playwright:

```bash
yarn playwright install chromium
```

## Run Tests

Run all tests in headless mode:

```bash
yarn test
```

Run all tests with the browser visible:

```bash
yarn test:headed
```

Run only the Contact Us test:

```bash
yarn playwright test tests/contact-us/test.spec.js --headed
```

Open Playwright UI mode:

```bash
yarn test:ui
```

Open the HTML report:

```bash
yarn report
```

## Assignment Screenshot

Before submitting the form, the test saves a full-page screenshot to:

```text
artifacts/screenshots/before-submit.png
```

This screenshot is intentionally kept in the repository as part of the assignment deliverables.

The screenshot is taken before clicking:

```text
Request a call back
```

## Playwright Artifacts

The Playwright configuration can retain test artifacts such as:

- Screenshots
- Traces
- Videos

These are separate from the assignment screenshot stored under:

```text
artifacts/screenshots/
```

The assignment screenshot is generated explicitly by the test and is not dependent on Playwright failure artifacts.

## Success Console Message

After the Thank You page is successfully verified, the test writes:

```text
Reached Thank You page successfully
```

The message is written to:

- The Playwright / Node.js terminal console.
- The browser page console.
