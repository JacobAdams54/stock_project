# 📄 CONTRIBUTING.md

# Contributing to Stalk.ai

Thank you for contributing to **Stalk.ai – AI-Powered Stock Predictions**!  
We follow consistent standards for **code, documentation, and testing** to keep the project clean and reliable.

---

## 🛠️ Project Structure

src/
components/ # Shared + domain components
auth/ # Login, Signup, etc.
charts/ # StockChart, StockChartWithData
stocks/ # StockCard, StockList
watchlist/ # Watchlist-related components
layout/ # Header, Footer, Sidebar, Hero
pages/ # Route-level pages (Dashboard, About, Predictions, etc.)
hooks/ # Custom hooks (useAuth, useStockData, etc.)
lib/ # Firebase config, API utils
styles/ # Tailwind + global CSS
tests/ # (optional) e2e tests
documentation/ # Standards, SRS, schema, usage examples

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

### Styling

We use **Material UI (`sx` prop) for consistency** across the application. Here's the styling approach:

- **Material UI Components** → Use the `sx` prop for styling (preferred for consistency)
- **Non-MUI Elements** → Use Tailwind CSS classes

**Why?** Using MUI components with the `sx` prop ensures visual consistency, respects the design system, and avoids conflicts between Tailwind and MUI styles.

#### Example: MUI Component with `sx`

```tsx
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

// Use sx prop for MUI components
<Box sx={{ display: 'flex', gap: 2 }}>
  <Drawer
    variant="permanent"
    sx={{
      display: { xs: 'none', sm: 'block' },
      '& .MuiDrawer-paper': {
        boxSizing: 'border-box',
        width: drawerWidth,
      },
    }}
  >
    {drawer}
  </Drawer>
</Box>
```

See [`src/components/layout/Sidebar.tsx`](../src/components/layout/Sidebar.tsx) for a real-world example of MUI styling with responsive breakpoints.

#### Example: Non-MUI Element with Tailwind

```tsx
// Use Tailwind classes for custom/non-MUI elements
<div className="flex gap-4 p-6 bg-gray-50">
  Custom content here
</div>
```

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
- [Material UI Icons](https://mui.com/material-ui/icons/#icon-font-icons)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Git Commit Message Guidelines](https://chris.beams.io/posts/git-commit/)
- [Writing Good Commit Messages](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
- [JSDoc Guide](https://jsdoc.app/about-getting-started.html)
