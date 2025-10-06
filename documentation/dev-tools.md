# Development Tools & Configuration

This document provides comprehensive information about the development tools configured in this project, recent optimizations, and how to use them effectively.

## 📚 Table of Contents

- [Overview](#overview)
- [Configuration Files](#configuration-files)
- [Available NPM Scripts](#available-npm-scripts)
- [ESLint Setup](#eslint-setup)
- [Prettier Setup](#prettier-setup)
- [Jest Testing Setup](#jest-testing-setup)
- [TypeScript Configuration](#typescript-configuration)
- [Babel Configuration](#babel-configuration)
- [Recent Optimizations](#recent-optimizations)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project uses a modern development stack optimized for React + TypeScript:

- **Build Tool**: Vite (with esbuild for fast builds)
- **Linting**: ESLint v9 (flat config format)
- **Formatting**: Prettier
- **Testing**: Jest with React Testing Library
- **Type Checking**: TypeScript (strict mode)
- **Transform for Tests**: Babel (Jest only)

---

## Configuration Files

| File                 | Purpose                        | Location |
| -------------------- | ------------------------------ | -------- |
| `vite.config.ts`     | Vite build configuration       | Root     |
| `eslint.config.js`   | ESLint v9 flat config          | Root     |
| `.prettierrc`        | Prettier formatting rules      | Root     |
| `.prettierignore`    | Files to exclude from Prettier | Root     |
| `jest.config.cjs`    | Jest test configuration        | Root     |
| `babel.config.json`  | Babel presets (Jest only)      | Root     |
| `tsconfig.json`      | TypeScript project references  | Root     |
| `tsconfig.app.json`  | TypeScript for source code     | Root     |
| `tsconfig.node.json` | TypeScript for build tools     | Root     |

---

## Available NPM Scripts

```bash
# Development
npm run dev          # Start Vite dev server (hot reload)

# Building
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint on all files
npm run format       # Auto-format all code with Prettier
npm run format:check # Check if code is formatted (CI/CD)

# Testing
npm run test         # Run Jest test suite
```

### Script Details

#### `npm run dev`

- Starts Vite development server
- Hot Module Replacement (HMR) enabled
- Typically runs on `http://localhost:5173`

#### `npm run build`

- Runs `tsc -b` to type-check your code
- Builds optimized production bundle with Vite
- Output goes to `dist/` directory

#### `npm run lint`

- Checks all `.ts` and `.tsx` files
- Uses ESLint v9 flat config
- Configured to warn on `console.log` statements
- Checks React Hooks rules and TypeScript best practices

#### `npm run format`

- Auto-formats all source files
- Applies Prettier rules from `.prettierrc`
- Formats `.ts`, `.tsx`, `.css`, and `.json` files in `src/`

#### `npm run format:check`

- Checks formatting without modifying files
- Useful for CI/CD pipelines
- Returns exit code 1 if files need formatting

---

## ESLint Setup

### Configuration (eslint.config.js)

We use **ESLint v9** with the new **flat config format**. Key features:

```javascript
// Two separate configurations:

1. App/Frontend code (src/**/*.{ts,tsx})
   - React + TypeScript rules
   - React Hooks linting
   - React Refresh (Vite HMR)
   - Prettier integration

2. Build tools (vite.config.ts)
   - Node.js globals
   - TypeScript rules
   - No React-specific rules
```

### Custom Rules

```javascript
"no-console": "warn"  // Warns on console.log (remove before production)
"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
// Allows unused vars starting with _ (e.g., _unused)
```

### Key Points

- ✅ Uses `typescript-eslint` unified package (v8+)
- ✅ Flat config format (ESLint v9+)
- ✅ Prettier integration to avoid conflicts
- ✅ Ignores `dist/` build output
- ⚠️ No type-aware linting (for faster performance)

### Adding Type-Aware Rules (Optional)

If you need stricter type checking, add to the app config:

```javascript
languageOptions: {
  parserOptions: {
    project: "./tsconfig.app.json",
  },
},
```

---

## Prettier Setup

### Configuration (.prettierrc)

```json
{
  "semi": true, // Use semicolons
  "singleQuote": true, // Use single quotes
  "tabWidth": 2, // 2 spaces for indentation
  "trailingComma": "es5", // Trailing commas where valid in ES5
  "printWidth": 80, // Wrap lines at 80 characters
  "arrowParens": "always", // Always include parens in arrow functions
  "endOfLine": "lf", // Unix-style line endings
  "bracketSpacing": true, // Spaces in object literals
  "jsxSingleQuote": false // Use double quotes in JSX
}
```

### What Gets Formatted

- All `.ts` and `.tsx` files in `src/`
- All `.css` files in `src/`
- All `.json` files in `src/`

### What Gets Ignored (.prettierignore)

- `dist/` - Build output
- `coverage/` - Test coverage reports
- `node_modules/` - Dependencies
- `package-lock.json` - Lock files

### IDE Integration

**VS Code**: Install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Jest Testing Setup

### Configuration (jest.config.cjs)

```javascript
{
  testEnvironment: "jest-environment-jsdom",  // Simulates browser DOM
  transform: { "^.+\\.[tj]sx?$": "babel-jest" },  // Babel transforms TS/JSX
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],  // Test setup
  clearMocks: true,  // Auto-clear mocks between tests
  collectCoverage: true,  // Generate coverage reports
  coverageDirectory: "coverage"
}
```

### Test Setup (src/setupTests.ts)

```typescript
import '@testing-library/jest-dom';
```

This adds custom matchers like:

- `expect(element).toBeInTheDocument()`
- `expect(element).toHaveClass('className')`
- `expect(element).toBeVisible()`

### Writing Tests

Example test structure:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test Libraries Available

- **Jest** - Test runner and assertion library
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom DOM matchers
- **@testing-library/user-event** - Simulate user interactions

---

## TypeScript Configuration

### Three Config Files

#### 1. `tsconfig.json` (Project References)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### 2. `tsconfig.app.json` (Application Code)

- **Target**: ES2022
- **Module**: ESNext
- **JSX**: react-jsx
- **Strict Mode**: Enabled
- **Includes**: `src/` directory
- **No Emit**: true (Vite handles bundling)

#### 3. `tsconfig.node.json` (Build Tools)

- **Target**: ES2022
- **Module Resolution**: Node
- **Includes**: `vite.config.ts`
- **Types**: Node.js

### Strict Mode Features

All strict checks are enabled:

- `noUnusedLocals` - Error on unused variables
- `noUnusedParameters` - Error on unused function params
- `noFallthroughCasesInSwitch` - Prevent switch fallthrough bugs
- All TypeScript `strict` family flags

---

## Babel Configuration

### Purpose

Babel is **only used for Jest testing**, NOT for building your app. Vite uses esbuild for production builds.

### Configuration (babel.config.json)

```json
{
  "presets": [
    "@babel/preset-env", // Modern JavaScript
    "@babel/preset-react", // JSX transform
    "@babel/preset-typescript" // TypeScript transform
  ]
}
```

### Why Babel + Vite?

- **Vite** uses esbuild for fast production builds
- **Jest** doesn't understand TypeScript/JSX natively
- **Babel** transforms your code for Jest tests only

This is the recommended setup for Vite + Jest!

---

## Recent Optimizations

### Changes Made (October 2025)

#### ✅ 1. Fixed setupTests.ts

**Issue**: Used deprecated import path  
**Before**: `import '@testing-library/jest-dom/extend-expect';`  
**After**: `import '@testing-library/jest-dom';`  
**Why**: Modern jest-dom (v6+) doesn't need `/extend-expect`

#### ✅ 2. Fixed ESLint Configuration

**Issue**: Used invalid `extends` property in flat config  
**Before**: ESLint v9 flat config with `extends` array  
**After**: Proper spread operator for rules (`...config.rules`)  
**Why**: ESLint v9 flat config doesn't support `extends`

#### ✅ 3. Created Prettier Configuration

**Issue**: No shared formatting rules  
**Added**: `.prettierrc` and `.prettierignore`  
**Added Scripts**: `npm run format` and `npm run format:check`  
**Why**: Team consistency and automated formatting

#### ✅ 4. Optimized Dependencies

**Removed**:

- `@typescript-eslint/eslint-plugin` (duplicate)
- `@typescript-eslint/parser` (duplicate)
- `jsdom` (included in jest-environment-jsdom)

**Kept**:

- `typescript-eslint` (unified package for ESLint v9)
- All Babel packages (required for Jest)

**Result**: 3 fewer dependencies, cleaner package.json

#### ✅ 5. Fixed CSS Structure

**Issue**: Empty `index.css` file, unused `globals.css`  
**Deleted**: `src/index.css`  
**Updated**: `main.tsx` to import `./styles/globals.css`  
**Kept**: `src/styles/globals.css` for global styles  
**Why**: Single source of truth for global styles

#### ✅ 6. Added Format Scripts

**Added**: `npm run format` - Auto-format code  
**Added**: `npm run format:check` - Check formatting  
**Why**: Easy formatting for developers and CI/CD

---

## Troubleshooting

### ESLint Issues

**Problem**: `Error: Cannot find module 'typescript-eslint'`  
**Solution**: Run `npm install` - the package is in devDependencies

**Problem**: `Parsing error` on TypeScript files  
**Solution**: Ensure `typescript-eslint` is installed and imported correctly

**Problem**: ESLint is slow  
**Solution**: Type-aware linting is disabled for performance. If you need it, see [Adding Type-Aware Rules](#adding-type-aware-rules-optional)

### Prettier Issues

**Problem**: Code doesn't format on save  
**Solution**: Install Prettier VS Code extension and configure settings (see [IDE Integration](#ide-integration))

**Problem**: Prettier conflicts with ESLint  
**Solution**: Already handled! `eslint-config-prettier` disables conflicting rules

### Jest Issues

**Problem**: `Cannot find module` errors in tests  
**Solution**: Ensure Babel presets are installed (they are in package.json)

**Problem**: `ReferenceError: document is not defined`  
**Solution**: Check `jest.config.cjs` has `testEnvironment: "jest-environment-jsdom"`

**Problem**: Jest matchers not working (e.g., `.toBeInTheDocument()`)  
**Solution**: Check `src/setupTests.ts` imports `@testing-library/jest-dom`

### Build Issues

**Problem**: TypeScript errors during build  
**Solution**: Run `npm run build` - it will show type errors. Fix them before building

**Problem**: Vite dev server won't start  
**Solution**:

1. Check port 5173 isn't already in use
2. Delete `node_modules` and run `npm install`
3. Check `vite.config.ts` for syntax errors

---

## Best Practices

### Before Committing

```bash
npm run lint          # Check for code issues
npm run format        # Auto-format code
npm run test          # Run tests
npm run build         # Ensure it builds
```

### Code Style

- Use single quotes for strings (Prettier enforces this)
- Use 2 spaces for indentation (Prettier enforces this)
- Remove `console.log` statements (ESLint warns about these)
- Use TypeScript types instead of `any`

### Testing

- Write tests for all new components
- Aim for meaningful tests, not just 100% coverage
- Use descriptive test names: `it('should render error message when API fails')`

### Git Workflow

1. Create feature branch from `main`
2. Make changes
3. Run linting, formatting, and tests
4. Commit with descriptive message
5. Push and create Pull Request
6. Address review comments
7. Merge after approval

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: October 5, 2025  
**Maintained By**: Development Team
