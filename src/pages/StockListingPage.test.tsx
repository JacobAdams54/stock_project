import { render, screen, within } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// The component under test (TDD: this file may be added before implementation).
import StockListingPage from './StockListingPage';

// Hook mock
const mockUseAllStockSummaries = jest.fn();
jest.mock('../hooks/useStockData', () => ({
  __esModule: true,
  useAllStockSummaries: (...args: any[]) => mockUseAllStockSummaries(...args),
}));

// Helper render with theme+router
const renderWithProviders = (
  ui: React.ReactElement,
  initialEntry: string = '/'
) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

// Data in the exact shape returned by useAllStockSummaries (StockRealtime)
const STOCKS_AAPL = {
  symbol: 'AAPL',
  address1: 'One Apple Park Way',
  change24hPercent: 1.8,
  city: 'Cupertino',
  companyName: 'Apple Inc.',
  country: 'United States',
  currentPrice: 175.23,
  dividendYield: 0.004,
  dividendYieldPercent: 0.4,
  fiftyTwoWeekHigh: 190,
  fiftyTwoWeekLow: 120,
  industry: 'Consumer Electronics',
  marketCap: 2_750_000_000_000,
  open: 174.0,
  peRatio: 30.5,
  sector: 'Technology',
  state: 'CA',
  updatedAt: Date.now(),
  volume: 1234567,
  website: 'https://www.apple.com',
  zip: '95014',
} as const;

const STOCKS_TSLA = {
  symbol: 'TSLA',
  address1: '3500 Deer Creek Road',
  change24hPercent: -4.3,
  city: 'Austin',
  companyName: 'Tesla, Inc.',
  country: 'United States',
  currentPrice: 254.12,
  dividendYield: 0,
  dividendYieldPercent: 0,
  fiftyTwoWeekHigh: 299.0,
  fiftyTwoWeekLow: 152.0,
  industry: 'Auto Manufacturers',
  marketCap: 800_000_000_000,
  open: 260.0,
  peRatio: 75,
  sector: 'Automotive',
  state: 'TX',
  updatedAt: Date.now(),
  volume: 987654,
  website: 'https://www.tesla.com',
  zip: '78725',
} as const;

beforeEach(() => {
  jest.clearAllMocks();
  // Default: return both stocks in natural order AAPL then TSLA
  mockUseAllStockSummaries.mockReturnValue({
    data: [STOCKS_AAPL, STOCKS_TSLA],
    loading: false,
    error: null,
  });
});

describe('StockListingPage', () => {
  test('search, sector filter and sort update displayed stocks', async () => {
    const user = userEvent.setup();

    // Return unsorted data so we can verify sort behavior
    mockUseAllStockSummaries.mockReturnValueOnce({
      data: [STOCKS_TSLA, STOCKS_AAPL], // TSLA first
      loading: false,
      error: null,
    });

    renderWithProviders(<StockListingPage />);

    const grid = screen.getByTestId('stock-grid');

    // Search by company name
    const search = screen.getByPlaceholderText(/search by symbol or company/i);
    await user.type(search, 'Tesla');
    expect(
      within(grid).queryByTestId('stock-card-AAPL')
    ).not.toBeInTheDocument();
    expect(within(grid).getByTestId('stock-card-TSLA')).toBeInTheDocument();

    // Clear and filter by sector: Automotive -> TSLA only
    await user.clear(search);
    const sector = screen.getByLabelText(/sector/i);
    await user.selectOptions(sector, 'Automotive');
    expect(
      within(grid).queryByTestId('stock-card-AAPL')
    ).not.toBeInTheDocument();
    expect(within(grid).getByTestId('stock-card-TSLA')).toBeInTheDocument();

    // Reset sector and sort by symbol ascending -> AAPL should appear before TSLA
    await user.selectOptions(sector, 'All');
    const sort = screen.getByLabelText(/sort/i);
    await user.selectOptions(sort, 'symbol-asc');
    const cards = within(grid).getAllByTestId(/stock-card-/i);
    const ids = cards.map((c) => c.getAttribute('data-testid'));
    expect(ids.indexOf('stock-card-AAPL')).toBeLessThan(
      ids.indexOf('stock-card-TSLA')
    );
  });

  test('clicking a stock card navigates to the stock detail route', async () => {
    const user = userEvent.setup();

    const App = () => (
      <Routes>
        <Route path="/" element={<StockListingPage />} />
        <Route
          path="/stocks/:symbol"
          element={<div data-testid="detail-route" />}
        />
      </Routes>
    );

    render(
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    );

    const grid = screen.getByTestId('stock-grid');
    const aaplLink = within(grid).getByTestId('stock-card-AAPL');
    await user.click(aaplLink);

    expect(await screen.findByTestId('detail-route')).toBeInTheDocument();
  });

  test('empty state message displays when no matches', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StockListingPage />);

    const search = screen.getByPlaceholderText(/search by symbol or company/i);
    await user.type(search, 'NO-SUCH-STOCK-XYZ');

    expect(
      screen.getByText(/No stocks found matching your criteria/i)
    ).toBeInTheDocument();
  });
});
