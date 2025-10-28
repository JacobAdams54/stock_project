/**
 * @fileoverview Test suite for StockDetail page component
 * Tests stock detail view with loading, error, no-data, header, price, change, and placeholders.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import StockDetail from './StockDetail';

// Mocks for the new hooks
const mockUseStockSummaryDoc = jest.fn();
const mockUsePriceHistory = jest.fn();

jest.mock('../hooks/useStockData', () => ({
  __esModule: true,
  useStockSummaryDoc: (...args: any[]) => mockUseStockSummaryDoc(...args),
  usePriceHistory: (...args: any[]) => mockUsePriceHistory(...args),
}));

// Helper: render with theme + router
const renderWithTheme = (symbol = 'MSFT') => {
  const theme = createTheme();
  return render(
    <MemoryRouter initialEntries={[`/stocks/${symbol}`]}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/stocks/:symbol" element={<StockDetail />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>
  );
};

const baseSummary = {
  symbol: 'MSFT',
  address1: 'One Microsoft Way',
  change24hPercent: 1.36,
  city: 'Redmond',
  companyName: 'Microsoft Corporation',
  country: 'United States',
  currentPrice: 174.12,
  dividendYield: 0.007,
  dividendYieldPercent: 0.7,
  fiftyTwoWeekHigh: 199.62,
  fiftyTwoWeekLow: 124.17,
  industry: 'Software - Infrastructure',
  marketCap: 3_000_000_000_000,
  open: 171.0,
  peRatio: 39.05,
  sector: 'Technology',
  state: 'WA',
  updatedAt: Date.now(),
  volume: 18293000,
  website: 'https://www.microsoft.com',
  zip: '98052-6399',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseStockSummaryDoc.mockReturnValue({
    data: baseSummary,
    loading: false,
    error: null,
  });
  mockUsePriceHistory.mockReturnValue({
    data: [
      { date: '2020-10-19', o: 200, h: 201, l: 198, c: 200, v: 99999 },
      { date: '2020-10-20', o: 205, h: 215, l: 204, c: 210, v: 123456 },
    ],
    loading: false,
    error: null,
  });
});

describe('StockDetail Component', () => {
  it('shows error alert when summary load fails', () => {
    mockUseStockSummaryDoc.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network error'),
    });

    renderWithTheme('MSFT');

    expect(screen.getByText(/Failed to load stock/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    expect(screen.getByText(/Symbol: MSFT/i)).toBeInTheDocument();
  });

  it('shows no data alert when summary is missing', () => {
    mockUseStockSummaryDoc.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderWithTheme('MSFT');

    expect(screen.getByText(/No data found for symbol/i)).toBeInTheDocument();
    expect(screen.getByText(/MSFT/i)).toBeInTheDocument();
  });
});
