# Developer Setup & Recommendations

This file summarizes how to get the repo ready for development, how to run tests, and team workflow recommendations.

> 📘 **For detailed information about development tools, configurations, and recent optimizations, see [dev-tools.md](./dev-tools.md)**

## 1. Install dependencies (recommended)

Use a fresh install on a machine with Node 18+ (LTS recommended). If you see peer dep conflicts, use the `--legacy-peer-deps` flag or align versions (React 18 is pinned in package.json):

```bash
# install deps (recommended)
npm install

# if you run into peer dependency issues, try:
npm install --legacy-peer-deps
```

## 2. Available Commands

```bash
# Development
npm run dev          # Start Vite dev server (hot reload)
npm run build        # Build for production (TypeScript check + Vite build)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint on all files
npm run format       # Auto-format all code with Prettier
npm run format:check # Check if code is formatted (CI/CD)

# Testing
npm run test         # Run Jest test suite
```

## 3. Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173 in your browser
```

## 4. Development Workflow

### Before Committing

```bash
npm run lint          # Check for code issues
npm run format        # Auto-format code
npm run test          # Run tests
npm run build         # Ensure it builds
```

### Creating a Feature

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run quality checks (lint, format, test)
4. Commit with a descriptive message
5. Push and create a Pull Request
6. Address review comments
7. Merge after approval

## 5. Tech Stack Summary

| Tool           | Purpose                 | Configuration       |
| -------------- | ----------------------- | ------------------- |
| **Vite**       | Build tool & dev server | `vite.config.ts`    |
| **TypeScript** | Type checking           | `tsconfig.*.json`   |
| **ESLint**     | Code linting            | `eslint.config.js`  |
| **Prettier**   | Code formatting         | `.prettierrc`       |
| **Jest**       | Testing framework       | `jest.config.cjs`   |
| **Babel**      | Test transformation     | `babel.config.json` |

> 📘 **See [dev-tools.md](./dev-tools.md) for detailed configuration information**

## 6. Project Structure

```
stock_project/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities & API clients
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Root component
│   └── main.tsx        # Application entry point
├── documentation/      # Project documentation
├── public/             # Static assets
└── [config files]      # Various tool configurations
```

## 7. Key Features & Configurations

### TypeScript

- ✅ Strict mode enabled
- ✅ JSX support with `react-jsx`
- ✅ Project references for faster builds
- ✅ Separate configs for app code and build tools

### ESLint

- ✅ ESLint v9 flat config format
- ✅ TypeScript support with `typescript-eslint`
- ✅ React Hooks rules
- ✅ Prettier integration (no conflicts)
- ⚠️ Warns on `console.log` statements

### Prettier

- ✅ Configured with team standards
- ✅ Single quotes, 2-space tabs
- ✅ Automatic formatting available
- ✅ Git-ignored files excluded

### Testing

- ✅ Jest with jsdom environment
- ✅ React Testing Library
- ✅ Custom DOM matchers (jest-dom)
- ✅ Coverage reports enabled

## 8. Troubleshooting

### Common Issues

**Build fails with TypeScript errors**

```bash
# Run TypeScript check to see detailed errors
npm run build
```

**ESLint errors**

```bash
# Auto-fix many issues
npm run lint -- --fix

# Format code
npm run format
```

**Tests failing**

```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose
```

**Port already in use**

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

> 📘 **For more troubleshooting, see [dev-tools.md](./dev-tools.md#troubleshooting)**

## 9. CI/CD Workflow

A GitHub Actions workflow is configured in `.github/workflows/ci.yml`:

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
          node-version: '18'
      - name: Install deps
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Build
        run: npm run build
      - name: Test
        run: npm test
```

## 10. Team Workflow Recommendations

### Branching Strategy

- Use feature branches for all changes
- Protect `main` branch with required reviews
- Require 1-2 reviewers per PR
- Require CI checks to pass before merging

### Code Review Checklist

- [ ] Code follows style guide (Prettier + ESLint)
- [ ] Tests are included and passing
- [ ] No console.log statements
- [ ] TypeScript types are used (no `any`)
- [ ] Changes are documented if needed

### Pull Requests

- Use the PR template in `documentation/pull_request_template.md`
- Link related issues
- Include screenshots for UI changes
- Keep PRs focused and reasonably sized

## 11. Additional Resources

- [Development Tools Documentation](./dev-tools.md) - Detailed tool configurations
- [Firebase Schema](./firebase_schema.md) - Database structure
- [Contributing Guide](./contributing.md) - Contribution guidelines
- [PR Template](./pull_request_template.md) - Pull request template

## 12. Recommended Improvements (Future)

- [ ] Add `husky` + `lint-staged` for pre-commit hooks
- [ ] Add `.env.example` with required Firebase keys
- [ ] Consider path aliases (`@/components`) in tsconfig
- [ ] Add `CODEOWNERS` for critical directories
- [ ] Set up Dependabot for dependency updates

---

**Last Updated**: October 5, 2025  
**Questions?** Check [dev-tools.md](./dev-tools.md) or reach out to the team!
