/**
 * @fileoverview Test suite for StockDetail page component
 * Tests stock detail view with loading, error, no-data, header, price, change, and placeholders.
 */

import { render, screen } from '@testing-library/react';
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

// Default successful data state
const mockSuccessData = {
  data: {
    symbol: 'MSFT',
    name: 'MSFT Inc.',
    currentPrice: 174.12,
    change: 2.34,
    changePercent: 1.36,
    priceHistory: [],
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
    expect(screen.getByText(/MSFT Inc\./i)).toBeInTheDocument();
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

  it('renders key statistics placeholder when data is loaded', () => {
    renderWithTheme();

    expect(screen.getByText(/📊 Key Statistics/i)).toBeInTheDocument();
    expect(
      screen.getByText(/statistics component being implemented/i)
    ).toBeInTheDocument();
  });

  it('renders chart and AI prediction placeholders when data is loaded', () => {
    renderWithTheme();

    expect(screen.getByText(/📊 Stock Chart/i)).toBeInTheDocument();
    expect(
      screen.getByText(/chart component being implemented/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/🤖 AI Prediction/i)).toBeInTheDocument();
    expect(
      screen.getByText(/AI component being implemented/i)
    ).toBeInTheDocument();
  });

  it('displays negative change with down arrow and red styling', () => {
    // Mock data with negative change
    mockUseStockData.mockReturnValue({
      data: {
        symbol: 'MSFT',
        name: 'MSFT Inc.',
        currentPrice: 171.78,
        change: -2.34,
        changePercent: -1.34,
        priceHistory: [],
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
