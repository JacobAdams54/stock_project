/** @jest-environment jsdom */
// src/components/layout/Header.test.tsx

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// ⬇️ If your component is named differently, change this import.
// You told me the file is Header2.tsx, so:
import Header from './Header';

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
    expect(screen.getByText(new RegExp(`^${label}$`, 'i'))).toBeInTheDocument();
  }

  // If your header shows "Sign Up" keep this test file up to date.
});
