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

1. **Clone**  
   - clone it locally.  

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
     - Jest + React Testing Library for unit tests.[testing docs](https://jestjs.io/docs/getting-started)
     - jest-axe for accessibility.  

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

- [Jest Testing Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Material UI](https://mui.com/getting-started/installation/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Git Commit Message Guidelines](https://chris.beams.io/posts/git-commit/)
- [Writing Good Commit Messages](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
- [JSDoc Guide](https://jsdoc.app/about-getting-started.html)
- 