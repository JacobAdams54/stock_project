# Testing Guide

## Overview

This project uses **Jest** and **React Testing Library** for unit testing with a minimum **80% coverage** requirement.

---

## Quick Start

### Run Tests
```bash
npm run test
```

### Watch Mode
```bash
npm run test -- --watch
```

### Coverage Report
```bash
npm run test -- --coverage
```

---

## Testing Standards

### Coverage Requirements
- **Statements**: ≥ 80%
- **Branches**: ≥ 80%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

### Test Location
Co-locate tests with components:
```
src/components/layout/
├── Sidebar.tsx
└── Sidebar.test.tsx
```

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders correctly', () => { ... });
  });

  describe('User Interactions', () => {
    it('handles clicks', () => { ... });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => { ... });
  });
});
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run all tests once |
| `npm run test -- --watch` | Run tests in watch mode |
| `npm run test -- --coverage` | Generate coverage report |
| `npm run test -- Sidebar.test.tsx` | Run specific test file |
| `npm run test -- --testNamePattern="Navigation"` | Run tests matching pattern |
| `npm run test -- -u` | Update snapshots |
| `npm run test -- --verbose` | Detailed output |

---

## Testing Tools

### Core Libraries
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **jest-axe**: Accessibility testing

### Utilities
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
```

---

## Example: Testing Sidebar

```typescript
describe('Sidebar Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    activePage: 'dashboard',
  };

  it('dispatches navigate event on click', () => {
    const spy = jest.spyOn(window, 'dispatchEvent');
    render(<Sidebar {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /predictions/i }));
    
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'navigate',
        detail: { page: 'predictions' }
      })
    );
  });
});
```

---

## Troubleshooting

### Tests Hanging
```bash
npm run test -- --detectOpenHandles
```

### Clear Jest Cache
```bash
npm run test -- --clearCache
```

### Debug Single Test
```bash
node --inspect-brk node_modules/.bin/jest --runInBand Sidebar.test.tsx
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-axe](https://github.com/nickcolley/jest-axe)