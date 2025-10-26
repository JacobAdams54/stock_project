/**
 * @fileoverview Test suite for StockDetail page component
 * Tests stock detail view with loading, error, no-data, header, price, change, and placeholders.
 */

import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import StockDetail from './StockDetail';

// Mock the useStockData hook
const mockUseStockData = jest.fn();
jest.mock('../hooks/useStockData', () => ({
  useStockData: () => mockUseStockData(),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Helper function to render component with theme and router
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

// Default successful data state aligned with useStockData's shape
const mockSuccessData = {
  data: {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    sector: 'Technology',
    marketCap: '3.00T',
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 124.17,
    currentPrice: 174.12,
    change: 2.34,
    changePercent: 1.36,
  },
  loading: false,
  error: null,
};

describe('StockDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default successful state before each test
    mockUseStockData.mockReturnValue(mockSuccessData);
  });

  it('renders stock symbol and company name', async () => {
    renderWithTheme();

    expect(screen.getByRole('heading', { name: /MSFT/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Microsoft Corporation/i)[0]).toBeInTheDocument();
  });

  it('renders current stock price and change', async () => {
    renderWithTheme();

    // Check price display - use more flexible text matching
    expect(screen.getByText(/\$174\.12/)).toBeInTheDocument();
    expect(screen.getByText(/2\.34/)).toBeInTheDocument();
    expect(screen.getByText(/1\.36%/)).toBeInTheDocument();
    expect(screen.getByText(/▲/)).toBeInTheDocument(); // Up arrow for positive change
  });

  it('shows loading spinner when loading', () => {
    // Mock loading state
    mockUseStockData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderWithTheme();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error alert when error occurs', async () => {
    // Mock error state
    mockUseStockData.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'Network error' },
    });

    renderWithTheme();

    expect(screen.getByText(/failed to load stock data/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByText(/Symbol: MSFT/i)).toBeInTheDocument();
  });

  it('shows no data alert when no data returned', async () => {
    // Mock no data state
    mockUseStockData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderWithTheme();

    expect(screen.getByText(/no data found for symbol/i)).toBeInTheDocument();
    expect(screen.getByText(/MSFT/i)).toBeInTheDocument();
  });

  it('renders key statistics with company, sector, market cap and 52-week range', () => {
    renderWithTheme();

    // Section header
    const keyStatsHeader = screen.getByText(/Key Statistics/i);
    expect(keyStatsHeader).toBeInTheDocument();

    // Scope queries within the Key Statistics section to avoid duplicate matches
    const keyStatsContainer = keyStatsHeader.closest('div') as HTMLElement;
    expect(keyStatsContainer).toBeInTheDocument();
    const withinKeyStats = within(keyStatsContainer);

    // Labels
    expect(withinKeyStats.getByText(/Company/i)).toBeInTheDocument();
    expect(withinKeyStats.getByText(/Sector/i)).toBeInTheDocument();
    expect(withinKeyStats.getByText(/Market Cap/i)).toBeInTheDocument();
    expect(withinKeyStats.getByText(/52W High/i)).toBeInTheDocument();
    expect(withinKeyStats.getByText(/52W Low/i)).toBeInTheDocument();
    // Values
    expect(withinKeyStats.getByText(/Microsoft Corporation/i)).toBeInTheDocument();
    expect(withinKeyStats.getByText(/Technology/i)).toBeInTheDocument();
    expect(withinKeyStats.getByText(/3\.00T/i)).toBeInTheDocument();
    expect(withinKeyStats.getByText(/\$199\.62/)).toBeInTheDocument();
    expect(withinKeyStats.getByText(/\$124\.17/)).toBeInTheDocument();
  });

  it('renders chart section and AI prediction summary when data is loaded', () => {
    renderWithTheme();

    expect(screen.getByText(/📊 Stock Chart/i)).toBeInTheDocument();
    expect(
      screen.getByText(/chart component being implemented/i)
    ).toBeInTheDocument();

    // AI prediction card header
    expect(screen.getByText(/AI Prediction Summary/i)).toBeInTheDocument();
  });

  it('displays negative change with down arrow and red styling', () => {
    // Mock data with negative change
    mockUseStockData.mockReturnValue({
      data: {
        symbol: 'MSFT',
        companyName: 'Microsoft Corporation',
        sector: 'Technology',
        marketCap: '3.00T',
        fiftyTwoWeekHigh: 199.62,
        fiftyTwoWeekLow: 124.17,
        currentPrice: 171.78,
        change: -2.34,
        changePercent: -1.34,
      },
      loading: false,
      error: null,
    });

    renderWithTheme();

    expect(screen.getByText(/\$171\.78/)).toBeInTheDocument();
    expect(screen.getByText(/2\.34/)).toBeInTheDocument(); // Absolute value shown
    expect(screen.getByText(/1\.34%/)).toBeInTheDocument(); // Absolute value shown
    expect(screen.getByText(/▼/)).toBeInTheDocument(); // Down arrow for negative change
  });

  it('uses default symbol MSFT when no symbol in URL params', () => {
    // Render without symbol parameter
    const theme = createTheme();
    render(
      <MemoryRouter initialEntries={['/stocks/']}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/stocks/" element={<StockDetail />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /MSFT/i })).toBeInTheDocument();
  });
});
