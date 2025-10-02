Here’s a **team-wide Documentation & Testing Best Practices guide** you can drop into your repo (e.g., as `CONTRIBUTING.md` or `docs/dev-standards.md`). It ensures that every issue, PR, and feature aligns with the same expectations.

---

# Development Standards: Documentation & Testing

This document defines **mandatory practices** for documentation and testing across our React + Tailwind + Firebase project.
Every feature, component, and service must meet these requirements before being merged.

---

## 1. Documentation Standards

### Component Documentation

* Each React component must include:

  * **File-level JSDoc comment** describing purpose, props, and usage.
  * Clear prop types (TypeScript or PropTypes).
  * Inline comments for complex logic.
* Example:

  ```tsx
  /**
   * StockChart Component
   * Renders a responsive line chart for a given ticker and time range.
   * Props:
   * - ticker (string): Stock ticker symbol (e.g., "AAPL").
   * - range (string): Time range ("1D" | "1W" | "1M" | "1Y" | "5Y").
   */
  ```

### Firebase Data & API Documentation

* All Firebase collections, fields, and query patterns must be documented in `docs/firebase-schema.md`.
* Every function that interacts with Firebase should describe:

  * The collection(s) it touches.
  * Expected input/output shape.
  * Security/validation rules (if relevant).

### Usage Examples

* Each reusable component/service must have a usage example in `docs/examples.md` or Storybook.
* Example snippets should show:

  * Basic usage.
  * Edge cases (empty states, loading, error).

---

## 2. Testing Standards

### Unit Tests

* All components and utility functions require unit tests with **Jest + React Testing Library**.
* Minimum coverage thresholds:

  * **80% statements**
  * **80% branches**
  * **80% functions**
  * **80% lines**
* Tests should validate:

  * Rendering with required/optional props.
  * Event handling (clicks, navigation, Firebase fetch success/error).
  * Edge states (empty data, loading, error).

### Integration Tests

* Complex flows (e.g., Firebase queries feeding charts) must have integration tests that:

  * Mock Firebase responses.
  * Validate correct rendering of UI states for each range (1D, 1W, etc.).

### Accessibility Tests

* Every component must be tested for basic accessibility:

  * Elements have appropriate `aria-*` attributes.
  * Interactive elements are keyboard-accessible.
  * Use `axe-core` or `jest-axe` to catch violations.

### Visual Regression (Optional)

* Key UI components (e.g., Hero, Header, Sidebar, Charts) should be tracked with visual regression testing (e.g., Chromatic or Percy) if available.

---

## 3. Pull Request Checklist

Every PR must:

* [ ] Include updated **tests** for new/changed code.
* [ ] Include updated **documentation** (component comments, schema docs, usage examples).
* [ ] Pass linting (`eslint`, `prettier`) and type checks (if TS).
* [ ] Meet coverage thresholds (`npm run test:coverage`).
* [ ] Be reviewed by at least one other team member.

---

## 4. Tools & Libraries

* **Testing**: Jest, React Testing Library, jest-axe (accessibility).
* **Docs**: JSDoc, Markdown (`docs/` folder).
* **Linting/Formatting**: ESLint, Prettier.
* **CI**: GitHub Actions (lint, test, build).

---

## 5. Example Folder Structure

```
src/
  components/
    StockChart/
      StockChart.tsx
      StockChart.test.tsx
      README.md   // local usage + props
  firebase/
    schema.md    // schema reference
docs/
  dev-standards.md
  examples.md
```
