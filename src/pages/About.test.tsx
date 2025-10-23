import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock lucide-react icons used by the About page so tests don't require the
// actual package to be installed. Each icon can be a simple span with role img.
jest.mock(
  'lucide-react',
  () => {
    const make = (name: string) => (props: any) => <span role="img">{name}</span>;
    return {
      __esModule: true,
      GitPullRequest: make('GitPullRequest'),
      Cpu: make('Cpu'),
      Target: make('Target'),
      Shield: make('Shield'),
      Clock: make('Clock'),
      Zap: make('Zap'),
      Users: make('Users'),
    };
  },
  { virtual: true }
);

import About from './About';

describe('About page', () => {
  it('renders hero, stats, story, features, team, and mission sections', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    // Hero
  expect(screen.getByRole('heading', { name: /ai-driven stock insights/i })).toBeTruthy();

    // Stats heading
  expect(screen.getByRole('heading', { name: /platform stats/i })).toBeTruthy();

    // Story
  expect(screen.getByRole('heading', { name: /our story/i })).toBeTruthy();

    // Features
  expect(screen.getByRole('heading', { name: /features/i })).toBeTruthy();

    // Team
  expect(screen.getByRole('heading', { name: /meet the team/i })).toBeTruthy();

    // Mission
  expect(screen.getByRole('heading', { name: /our mission/i })).toBeTruthy();
  });
});
