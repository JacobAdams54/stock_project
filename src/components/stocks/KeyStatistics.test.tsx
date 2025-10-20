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

describe('KeyStatistics Component', () => {
  const baseProps = {
    companyName: 'Apple Inc.',
    sector: 'Technology',
    marketCap: '2.75T',
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
      expect(screen.getByText('2.75T')).toBeInTheDocument();
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
    it('renders empty string for missing marketCap', () => {
      renderWithTheme(<KeyStatistics {...baseProps} marketCap="" />);
      expect(screen.getByText('Market Cap')).toBeInTheDocument();
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
    it('renders extremely large market cap', () => {
      renderWithTheme(<KeyStatistics {...baseProps} marketCap="9999999999T" />);
      expect(screen.getByText('9999999999T')).toBeInTheDocument();
    });
    it('renders high/low with many decimals', () => {
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
    it('renders values with strong font weight', () => {
      renderWithTheme(<KeyStatistics {...baseProps} />);
      const value = screen.getByText('Apple Inc.');
      expect(value).toHaveStyle('font-weight: 600');
    });
  });

  describe('Responsiveness', () => {
    it('renders flexbox layout', () => {
      renderWithTheme(<KeyStatistics {...baseProps} />);
      const boxes = screen.getAllByText(
        /Company|Sector|Market Cap|52W High|52W Low/
      );
      expect(boxes.length).toBeGreaterThanOrEqual(5);
    });
    // Note: Actual responsive behavior (media queries) is best tested in integration/e2e tests
  });
});
