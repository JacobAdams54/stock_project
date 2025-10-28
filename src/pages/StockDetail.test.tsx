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

jest.mock('@/hooks/useStockData', () => ({
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

// Shared formatters for expectations
const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const fmtCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

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
  it('renders stock symbol and company name', () => {
    renderWithTheme('MSFT');

    expect(screen.getByRole('heading', { name: /MSFT/i })).toBeInTheDocument();
    expect(screen.getByText(/Microsoft Corporation/i)).toBeInTheDocument();
  });

  it('renders current stock price and 24h change with arrow', () => {
    renderWithTheme('MSFT');

    expect(
      screen.getByText(fmtUSD.format(baseSummary.currentPrice))
    ).toBeInTheDocument();
    // Change line contains arrow + percentage, e.g., "▲ +1.36%"
    expect(screen.getByText(/▲ \+1\.36%/)).toBeInTheDocument();
  });

  it('shows loading spinner when summary is loading', () => {
    mockUseStockSummaryDoc.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
    mockUsePriceHistory.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderWithTheme('MSFT');

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

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

  it('renders Key Statistics and values', () => {
    renderWithTheme('MSFT');

    expect(screen.getByText(/Key Statistics/i)).toBeInTheDocument();
    expect(screen.getByText(/Company/i)).toBeInTheDocument();
    expect(screen.getByText(/Sector/i)).toBeInTheDocument();
    expect(screen.getByText(/Market Cap/i)).toBeInTheDocument();
    expect(screen.getByText(/52W High/i)).toBeInTheDocument();
    expect(screen.getByText(/52W Low/i)).toBeInTheDocument();

    expect(screen.getByText(baseSummary.companyName)).toBeInTheDocument();
    expect(screen.getByText(baseSummary.sector)).toBeInTheDocument();
    expect(
      screen.getByText(fmtCompact.format(baseSummary.marketCap))
    ).toBeInTheDocument();
    expect(
      screen.getByText(`$${baseSummary.fiftyTwoWeekHigh.toFixed(2)}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`$${baseSummary.fiftyTwoWeekLow.toFixed(2)}`)
    ).toBeInTheDocument();
  });

  it('renders price history placeholder and shows loaded bars count', () => {
    renderWithTheme('MSFT');

    expect(
      screen.getByText(/Price History \(placeholder\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Daily OHLC data is fetched from \/prices\/MSFT\/daily/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Loaded 2 daily bars/i)).toBeInTheDocument();
  });

  it('displays negative change with down arrow and minus percentage', () => {
    mockUseStockSummaryDoc.mockReturnValue({
      data: { ...baseSummary, change24hPercent: -1.34, currentPrice: 171.78 },
      loading: false,
      error: null,
    });

    renderWithTheme('MSFT');

    expect(screen.getByText(fmtUSD.format(171.78))).toBeInTheDocument();
    expect(screen.getByText(/▼ -1\.34%/)).toBeInTheDocument();
  });

  it('uses default symbol AAPL when no symbol in URL params', () => {
    const theme = createTheme();

    mockUseStockSummaryDoc.mockReturnValue({
      data: {
        ...baseSummary,
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        change24hPercent: 2.1,
        currentPrice: 268.81,
      },
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/stocks/']}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/stocks/" element={<StockDetail />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /AAPL/i })).toBeInTheDocument();
  });
});
