# Trace Viewer practice

The demo spec fails on purpose so there is a real trace to read.

## Produce and open a trace
```bash
TRACE_DEMO=1 HEADLESS=1 npx playwright test tests/demo/trace-demo.spec.ts --trace on
```
```bash
npx playwright show-trace test-results/demo-trace-demo-*/trace.zip
```
Or drag the `trace.zip` into https://trace.playwright.dev (the file stays in your browser).

## What to look at
| Panel | Question it answers |
|---|---|
| Timeline | Where did the time go, and which action failed? |
| Actions | What did each step do, and what did the page look like before and after? |
| Network | Which API calls ran? This app loads the catalog with an HTTP `QUERY` call, with the filters in the body. |
| Console | Did the app log an error around the failure? |
| Source | Which line of the spec was running? |

## Exercise
1. Open the trace and find the failing `toHaveCount` assertion.
2. In the DOM snapshot, count the `product-name` elements.
3. In Network, find the search response and compare its `data` length with the DOM.
4. Decide: bad test, or bad app? Here the test is wrong: it expects exactly one match.

In CI, traces are saved only on the first retry (`trace: 'on-first-retry'`), and uploaded as artifacts.
