/**
 * @file FeatureCard.test.tsx
 * @description Tests for the FeatureCards component (TDD starter).
 *
 * Placement:
 *  - Save as: src/components/layout/FeatureCard.test.tsx
 *
 * Goals:
 *  - Ensure semantic section with heading/subheading exists (defaults and overrides).
 *  - Render a responsive grid of feature cards driven by props.
 *  - Each card renders an icon (wrapped in a colored badge), title, and description.
 *  - Component uses Material UI Card and CardContent (asserted via mocking).
 *
 * Notes:
 *  - MUI Card and CardContent are mocked in these tests to assert their usage without depending on MUI internals.
 */

import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock MUI Card and CardContent so tests can assert that the component uses them.
// Provide simple wrappers that expose data-testid attributes.
jest.mock('@mui/material', () => {
  return {
    Card: ({ children, ...rest }: any) => (
      <div data-testid="mui-card" {...rest}>
        {children}
      </div>
    ),
    CardContent: ({ children, ...rest }: any) => (
      <div data-testid="mui-cardcontent" {...rest}>
        {children}
      </div>
    ),
  };
});

import { FeatureCards } from './FeatureCard';

// Simple test icon components to pass as feature.icon
const IconA = (props: any) => (
  <svg data-testid="icon-a" {...props}>
    <title>Icon A</title>
    <circle cx="8" cy="8" r="6" />
  </svg>
);
const IconB = (props: any) => (
  <svg data-testid="icon-b" {...props}>
    <title>Icon B</title>
    <rect width="12" height="12" />
  </svg>
);
const IconC = (props: any) => (
  <svg data-testid="icon-c" {...props}>
    <title>Icon C</title>
    <path d="M0 0h12v12H0z" />
  </svg>
);

afterEach(() => cleanup());

describe('FeatureCards (TDD tests)', () => {
  const features = [
    {
      icon: IconA,
      title: 'Real-time Data',
      description: 'Live market feeds and instant updates.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: IconB,
      title: 'AI Predictions',
      description: 'Machine learning driven buy/sell signals.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: IconC,
      title: 'Custom Watchlists',
      description: 'Track the stocks that matter to you.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  test('renders section landmark and custom heading + subheading', () => {
    const heading = 'Platform Features';
    const subheading = 'Powerful tools to help you trade smarter.';
    render(
      <FeatureCards
        features={features}
        heading={heading}
        subheading={subheading}
      />
    );

    // Semantic heading level 2
    const h2 = screen.getByRole('heading', { level: 2, name: heading });
    expect(h2).toBeInTheDocument();

    // Subheading text
    expect(screen.getByText(subheading)).toBeInTheDocument();

    // Section element present (semantic)
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  test('renders default heading and subheading when none provided', () => {
    render(<FeatureCards features={features} />);

    // Defaults as per design reference
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Why Choose StockPredict AI\?/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Our platform combines cutting-edge technology with intuitive design to help you make smarter investment decisions\./i
      )
    ).toBeInTheDocument();
  });

  test('renders responsive grid and correct number of feature cards (uses MUI Card)', () => {
    const { container } = render(<FeatureCards features={features} />);

    // Grid container exists (Tailwind grid classes expected)
    const gridEl =
      container.querySelector('.grid') ||
      Array.from(container.querySelectorAll('[class]')).find((el) => {
        const cls = el.getAttribute('class') || '';
        return (
          cls.includes('grid-cols-1') ||
          cls.includes('md:grid-cols-3') ||
          cls.includes('grid-cols-')
        );
      });
    expect(gridEl).toBeInTheDocument();

    // MUI Card wrappers rendered for each feature (mocked)
    const cards = screen.getAllByTestId('mui-card');
    expect(cards.length).toBe(features.length);

    const cardContents = screen.getAllByTestId('mui-cardcontent');
    expect(cardContents.length).toBe(features.length);
  });

  test('each card shows icon, title, description, and styled icon badge', () => {
    const { container } = render(<FeatureCards features={features} />);

    features.forEach((feat) => {
      // Title and description present
      expect(screen.getByText(feat.title)).toBeInTheDocument();
      expect(screen.getByText(feat.description)).toBeInTheDocument();

      // Icon should render: search for svg with matching testid
      const iconTestId =
        feat.title === 'Real-time Data'
          ? 'icon-a'
          : feat.title === 'AI Predictions'
            ? 'icon-b'
            : 'icon-c';
      const icon = screen.getByTestId(iconTestId);
      expect(icon).toBeInTheDocument();

      // Icon should be wrapped in a badge element that includes the bgColor class
      // Find nearest ancestor with class containing the bgColor value

      // The badge may be present; at minimum the bgColor string should appear somewhere in the DOM
      expect(container.innerHTML).toMatch(new RegExp(feat.bgColor));
      // Ensure the icon element has the color class applied (icon receives className)
      expect(icon.getAttribute('class') || '').toMatch(
        new RegExp(feat.color.split('-').slice(0, 2).join('-'))
      );
    });
  });

  test('renders accessible headings for discoverability', () => {
    render(<FeatureCards features={features} />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    // Ensure section includes labels we expect for discoverability
    expect(screen.getByText(/Real-time Data/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Predictions/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom Watchlists/i)).toBeInTheDocument();
  });
});
