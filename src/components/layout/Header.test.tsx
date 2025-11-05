/** @jest-environment jsdom */
// src/components/layout/Header.test.tsx

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock the AuthContext used by Header so tests are deterministic and don't
// rely on Firebase. We return a logged-out state where `loading` is false
// and `user` is null so the header shows Login / Sign Up buttons.
jest.mock('../layout/AuthContext', () => ({
  useAuth: () => ({ user: null, isAdmin: false, loading: false }),
}));

// Force desktop layout in tests so the header renders the horizontal nav
// (Login / Sign Up) instead of the mobile hamburger menu.
jest.mock('@mui/material/useMediaQuery', () => () => true);

// Import after the mock so Header receives the mocked hook
import Header from './Header';

// Mock firebase modules that run on import in Node (avoid fetch/polyfills in tests)
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../firebase/firebase', () => ({ auth: {} }));

test('renders banner and core nav labels', () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  // landmark + logo
  expect(screen.getByTestId('header')).toBeInTheDocument();

  // Core items your current header actually renders
  for (const label of ['Home', 'Stocks', 'About', 'Login']) {
    const matches = screen.queryAllByText(new RegExp(`^${label}$`, 'i'));
    expect(matches.length).toBeGreaterThan(0);
  }

  // If your header shows "Sign Up" keep this test file up to date.
});
