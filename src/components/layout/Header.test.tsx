/// <reference types="jest" />
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock Auth hook so Header renders deterministically (logged-out)
jest.mock('../layout/AuthContext', () => ({
  useAuth: () => ({ user: null, isAdmin: false, loading: false }),
}));

// Mock firebase modules to avoid import-time side-effects in Node
jest.mock('firebase/auth', () => ({ signOut: () => Promise.resolve() }));
jest.mock('../../firebase/firebase', () => ({ auth: {} }));

// Force desktop layout in tests so the header renders the horizontal nav
// Instead of mocking the module, stub window.matchMedia which MUI's
// useMediaQuery relies on. This is more robust across MUI versions.
function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => { },
      removeListener: () => { },
      addEventListener: () => { },
      removeEventListener: () => { },
      dispatchEvent: () => false,
    }),
  });
}

// Import after mocks so Header receives the mocked dependencies
import Header from './Header';

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => setMatchMedia(true));
  test('renders banner and core nav labels', async () => {
    renderHeader();

    // landmark + logo
    await waitFor(() => expect(screen.getByTestId('header')).toBeInTheDocument());

    // Core items your current header actually renders. Use queryAll to
    // tolerate duplicate nodes (nav + menu) in the DOM.
    await waitFor(() => {
      for (const label of ['Home', 'Stocks', 'About', 'Login']) {
        const matches = screen.queryAllByText(new RegExp(`^${label}$`, 'i'));
        expect(matches.length).toBeGreaterThan(0);
      }
    });
  });

  test('mobile menu toggles when hamburger clicked (desktop forced off)', async () => {
    // Simulate mobile viewport by setting matchMedia to false
    setMatchMedia(false);

    renderHeader();

    // The hamburger button should be present
    const button = screen.getByLabelText(/open navigation menu/i);
    expect(button).toBeInTheDocument();

    // Click the hamburger and assert menu items appear
    // Prefer waitFor to wrap any async state effects
    button.click();

    await waitFor(() => {
      const home = screen.queryAllByText(/^Home$/i);
      expect(home.length).toBeGreaterThan(0);
    });
  });
});