// Keep edits limited to About tests: add a focused console filter to reduce
// noisy React/MUI dev warnings during local test runs. We only filter the
// very specific messages related to "not wrapped in act(...)" and the
// "No routes matched location" route warning so other console output
// remains visible.
const __origConsoleError = console.error;
const __origConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
  try {
    const maybe = typeof args[0] === 'string' ? args[0] : '';
    if (
      maybe.includes('not wrapped in act(') ||
      (maybe.includes('An update to') && maybe.includes('inside a test was not wrapped in act'))
    ) {
      return;
    }
  } catch {
    // fallthrough to original
  }
  return __origConsoleError(...(args as [unknown, ...unknown[]]));
};

console.warn = (...args: unknown[]) => {
  try {
    const maybe = typeof args[0] === 'string' ? args[0] : '';
    if (maybe.includes('No routes matched location')) return;
  } catch {
    // fallthrough
  }
  return __origConsoleWarn(...(args as [unknown, ...unknown[]]));
};

// Ensure test matchers from jest-dom (like toBeInTheDocument) are available
// for TypeScript in this test file. The project also imports this in
// `src/setupTests.ts` for runtime, but adding it here guarantees the
// type augmentation is picked up by the TS language server for isolated
// test files/editors.
import '@testing-library/jest-dom';

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock MUI icon exports used by the About page so tests don't require the
// actual package to be installed. Each icon can be a simple span with role img.
jest.mock('@mui/icons-material', () => {
  const make = (name: string) => () => <span role="img">{name}</span>;
  return {
    __esModule: true,
    Memory: make('Memory'),
    CenterFocusStrong: make('CenterFocusStrong'),
    Security: make('Security'),
    FlashOn: make('FlashOn'),
    Group: make('Group'),
    AccessTime: make('AccessTime'),
    Twitter: make('Twitter'),
    LinkedIn: make('LinkedIn'),
    GitHub: make('GitHub'),
  };
});

import About from './About';

describe('About page', () => {
  afterAll(() => {
    // restore originals so other test runs/processes aren't affected
    console.error = __origConsoleError;
    console.warn = __origConsoleWarn;
  });
  it('renders hero, stats, story, features, team, and mission sections', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    // Hero
  expect(screen.getByRole('heading', { name: /ai-driven stock insights/i })).toBeInTheDocument();

    // Stats heading
  expect(screen.getByRole('heading', { name: /platform stats/i })).toBeInTheDocument();

    // Story
  expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument();

    // Features
  expect(screen.getByRole('heading', { name: /features/i })).toBeInTheDocument();

    // Team
  expect(screen.getByRole('heading', { name: /meet the team/i })).toBeInTheDocument();

    // Mission
  expect(screen.getByRole('heading', { name: /our mission/i })).toBeInTheDocument();
  });
});
