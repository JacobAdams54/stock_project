/**
 * @fileoverview Test suite for KeyStatistics component
 * Covers rendering, edge cases, accessibility, and responsiveness
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import KeyStatistics from './KeyStatistics';

// Helper to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Match component's formatter
const fmtCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

describe('KeyStatistics Component', () => {
  const baseProps = {
    companyName: 'Apple Inc.',
    sector: 'Technology',
    marketCap: 2_750_000_000_000, // 2.75T
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 124.17,
  };

  describe('Basic Rendering', () => {
    it('renders all key statistics labels and values', () => {
      renderWithTheme(<KeyStatistics {...baseProps} />);

      expect(screen.getByText('Key Statistics')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('Sector')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Market Cap')).toBeInTheDocument();

      const expectedCap = fmtCompact.format(baseProps.marketCap); // "2.75T"
      expect(screen.getByText(expectedCap)).toBeInTheDocument();

      expect(screen.getByText('52W High')).toBeInTheDocument();
      expect(screen.getByText('$199.62')).toBeInTheDocument();
      expect(screen.getByText('52W Low')).toBeInTheDocument();
      expect(screen.getByText('$124.17')).toBeInTheDocument();
    });
  });

  describe('Edge Cases: Missing/Insufficient Data', () => {
    it('renders empty string for missing companyName', () => {
      renderWithTheme(<KeyStatistics {...baseProps} companyName="" />);
      expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('renders empty string for missing sector', () => {
      renderWithTheme(<KeyStatistics {...baseProps} sector="" />);
      expect(screen.getByText('Sector')).toBeInTheDocument();
    });

    it('renders 0 for missing marketCap', () => {
      renderWithTheme(<KeyStatistics {...baseProps} marketCap={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders 0 for missing fiftyTwoWeekHigh', () => {
      renderWithTheme(<KeyStatistics {...baseProps} fiftyTwoWeekHigh={0} />);
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('renders 0 for missing fiftyTwoWeekLow', () => {
      renderWithTheme(<KeyStatistics {...baseProps} fiftyTwoWeekLow={0} />);
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('Edge Cases: Excessive Data', () => {
    it('renders very long company and sector names', () => {
      const longName = 'A'.repeat(100);
      renderWithTheme(
        <KeyStatistics
          {...baseProps}
          companyName={longName}
          sector={longName}
        />
      );
      const elements = screen.getAllByText(longName);
      expect(elements.length).toBe(2);
    });

    it('renders extremely large market cap (compact notation)', () => {
      const huge = 9_999_000_000_000_000; // ~9,999T, still safe for Number
      const expected = fmtCompact.format(huge);
      renderWithTheme(<KeyStatistics {...baseProps} marketCap={huge} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('renders high/low with many decimals (rounded to 2)', () => {
      renderWithTheme(
        <KeyStatistics
          {...baseProps}
          fiftyTwoWeekHigh={123.456789}
          fiftyTwoWeekLow={98.7654321}
        />
      );
      expect(screen.getByText('$123.46')).toBeInTheDocument();
      expect(screen.getByText('$98.77')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders labels with correct text', () => {
      renderWithTheme(<KeyStatistics {...baseProps} />);
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Sector')).toBeInTheDocument();
      expect(screen.getByText('Market Cap')).toBeInTheDocument();
      expect(screen.getByText('52W High')).toBeInTheDocument();
      expect(screen.getByText('52W Low')).toBeInTheDocument();
    });
  });

  describe('Responsiveness', () => {
    it('renders flexbox layout (labels present)', () => {
      renderWithTheme(<KeyStatistics {...baseProps} />);
      const boxes = screen.getAllByText(
        /Company|Sector|Market Cap|52W High|52W Low/
      );
      expect(boxes.length).toBeGreaterThanOrEqual(5);
    });
    // Note: Actual responsive behavior (media queries) is best tested in integration/e2e tests
  });
});
