Developer setup & recommendations

This file summarizes how to get the repo ready for development, how to run tests, and a few recommended small fixes for a smooth team workflow.

1. Install dependencies (recommended)

Use a fresh install on a machine with Node 18+ (LTS recommended). If you see peer dep conflicts, use the `--legacy-peer-deps` flag or align versions (React 18 is pinned in package.json):

```bash
# install deps (recommended)
npm install

# if you run into peer dependency issues, try:
npm install --legacy-peer-deps
```

2. Build & dev server

```bash
# start development server
npm run dev

# build for production (compiles TS and bundles)
npm run build
```

3. Run tests

We configure Jest with babel-jest and jsdom. After installing dependencies run:

```bash
npm test
```

Notes: If tests fail with transformer errors, ensure `@babel/preset-react`, `@babel/preset-typescript`, and `babel-jest` are installed (they're listed in devDependencies after recent updates).

4. Quick checklist (audit summary)

- TypeScript
  - `tsconfig.json` is set to `strict: true` with `jsx: react-jsx`. Good for catching errors early.
  - `noEmit: true` is used and `tsc -b` is run in `build` script; good practice.

- Vite
  - `vite.config.ts` uses `@vitejs/plugin-react`. Good default for React + TS.

- ESLint
  - `eslint.config.js` is present and includes recommended configs + Prettier. One potential issue: it imports `typescript-eslint` as a package name — the canonical packages are `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` (both already in devDependencies). The import line in the config uses `import tseslint from "typescript-eslint";` which will likely fail. Recommend changing that import to either:
    - `import tseslint from '@typescript-eslint/eslint-plugin';` (for plugin) and use `@typescript-eslint/parser` in languageOptions or specify parser in the extends config.

- Testing
  - Added `jest.config.ts` to use `jest-environment-jsdom`, transform via `babel-jest`, and `setupFilesAfterEnv` points to `src/setupTests.ts`.
  - `src/setupTests.ts` contains `@testing-library/jest-dom` import (devDependency added). Good.

- Formatting & Prettier
  - `prettier` is included and ESLint config extends `prettier`. Consider adding a `.prettierrc` and an `.editorconfig` for team consistency.

5. Recommended small improvements (low risk)

- Fix ESLint imports: update `eslint.config.js` to import `@typescript-eslint/eslint-plugin` correctly and/or add `parser` from `@typescript-eslint/parser` for TS files.
- Add `lint-staged` + `husky` to run ESLint and Prettier on staged files. Example devDeps: `husky`, `lint-staged`.
- Add a `test` GitHub Actions workflow to run `npm ci`, `npm run lint`, and `npm test` on PRs (example snippet below).
- Add an `.env.example` with required Firebase-related keys (do NOT commit secrets).
- Consider adding `paths` to `tsconfig.json` if you want `@/components` style imports.
- Add `@types/jest` to devDependencies (already added) so IDE autocompletion works for tests.

6. Minimal CI workflow (GitHub Actions)

Place in `.github/workflows/ci.yml`:

```yaml
name: CI
on: [pull_request, push]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - name: Install deps
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Build
        run: npm run build
      - name: Test
        run: npm test
```

7. Team workflow recommendations (for a 5-person class project)

- Branching: Use feature branches and PRs. Protect `main` with required reviews (1-2 reviewers) and required CI checks.
- PR template: There's a PR template in `documentation/`; ensure reviewers check lint, tests, and accessibility.
- Code owners: Consider adding `CODEOWNERS` for critical directories like `lib/` or `pages/`.
- Local dev: Add `README` run commands (already present) and add troubleshooting tips for common errors.

8. Next steps for me (I can help with any of the following):

- Fix the ESLint import issue in `eslint.config.js`.
- Add `husky` + `lint-staged` setup.
- Create the GitHub Actions workflow file and commit it.
- Run `npm install` and run the test suite here to validate end-to-end (if you want me to run it in this environment).
