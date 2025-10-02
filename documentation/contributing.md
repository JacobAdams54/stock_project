# 📄 CONTRIBUTING.md

# Contributing to Stalk.ai

Thank you for contributing to **Stalk.ai – AI-Powered Stock Predictions**!  
We follow consistent standards for **code, documentation, and testing** to keep the project clean and reliable.

---

## 🛠️ Project Structure

src/
components/        # Shared + domain components
auth/            # Login, Signup, etc.
charts/          # StockChart, StockChartWithData
stocks/          # StockCard, StockList
watchlist/       # Watchlist-related components
layout/          # Header, Footer, Sidebar, Hero
pages/             # Route-level pages (Dashboard, About, Predictions, etc.)
hooks/             # Custom hooks (useAuth, useStockData, etc.)
lib/               # Firebase config, API utils
styles/            # Tailwind + global CSS
tests/               # (optional) e2e tests
documentation/       # Standards, SRS, schema, usage examples

---

## ✅ Contribution Workflow

1. **Fork & Clone**  
   - Fork the repo and clone it locally.  
   - Add the upstream remote:  
     ```bash
     git remote add upstream https://github.com/<org>/stalk.ai.git
     ```

2. **Branching**  
   - Use feature branches:  
     ```
     git checkout -b feature/<short-description>
     ```
   - Example: `feature/add-stock-chart`

3. **Code Standards**  
   - Use **React + TSX** with **Tailwind + Material UI**.  
   - Follow existing **component vs page separation**.  
   - Keep Firebase logic isolated in `lib/` or `hooks/`.

4. **Testing**  
   - Co-locate unit tests with components (`Component.test.tsx`).  
   - Ensure minimum **80% coverage** across statements, branches, functions, and lines.  
   - Use:  
     - Jest + React Testing Library for unit tests.  
     - jest-axe for accessibility.  
     - Cypress/Playwright for e2e (if in `tests/e2e/`).  

5. **Documentation**  
   - Every component and function must have **JSDoc comments**.  
   - Update or add **usage examples** in `documentation/examples.md`.  
   - Update **Firebase schema** docs if data changes.

6. **Commit Messages**  
   - Use clear, imperative style:  
     - `feat: add StockChart component`  
     - `fix: resolve Firebase query bug`  
     - `docs: update contributing guide`  

7. **Pull Requests**  
   - Open PRs against `main`.  
   - Fill out the PR template (see below).  
   - Ensure CI checks (lint, tests, build) pass.

---

## 🔍 Coding Style

- **Linting:** Run `npm run lint` before committing.  
- **Formatting:** Run `npm run format` (Prettier).  
- **Imports:** Group imports (`react`, `lib`, `components`, `styles`).  
- **Naming:**  
  - Components: `PascalCase`  
  - Hooks: `useCamelCase`  
  - Variables/functions: `camelCase`

---

## 🚦 PR Review Process

- At least **1 reviewer approval** is required.  
- All **tests & docs must be updated** before merge.  
- PRs should remain **under 400 lines** when possible — split into smaller PRs if larger.

---

## 📚 References

- [SRS – Software Requirement Specification](./documentation/SRS%20-%20Software%20Requirement%20Specification.pdf)  
- [Development Standards](./documentation/dev-standards.md)  
- [Firebase Schema](./documentation/firebase-schema.md)  
