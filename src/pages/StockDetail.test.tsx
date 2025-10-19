/**
 * @fileoverview Test suite for StockDetail page component
 * Tests stock detail view with real-time price data, key statistics,
 * tabs navigation, and responsive behavior for initial prototype.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import StockDetail from './StockDetail';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock Material UI icons
jest.mock('@mui/icons-material/ArrowBack', () => ({
  __esModule: true,
  default: () => <div data-testid="back-icon">Back Icon</div>,
}));
jest.mock('@mui/icons-material/TrendingUp', () => ({
  __esModule: true,
  default: () => <div data-testid="trending-up-icon">Trending Up</div>,
}));
jest.mock('@mui/icons-material/TrendingDown', () => ({
  __esModule: true,
  default: () => <div data-testid="trending-down-icon">Trending Down</div>,
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

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('StockDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders stock symbol and company name', () => {
      renderWithTheme();

      expect(screen.getByText(/MSFT/i)).toBeInTheDocument();
      expect(screen.getByText(/Apple Inc\./i)).toBeInTheDocument();
    });

    it('renders current stock price', () => {
      renderWithTheme();

      expect(screen.getByText(/\$174\.12/i)).toBeInTheDocument();
    });

    it('renders price change with percentage', () => {
      renderWithTheme();

      expect(screen.getByText(/\+2\.34/i)).toBeInTheDocument();
      expect(screen.getByText(/1\.36%/i)).toBeInTheDocument();
    });

    it('displays loading state while fetching data', () => {
      renderWithTheme();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays error message when stock not found', async () => {
      renderWithTheme('INVALID');

      await waitFor(() => {
        expect(screen.getByText(/stock not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Key Statistics Section', () => {
    it('renders key statistics heading', () => {
      renderWithTheme();

      expect(screen.getByText(/key statistics/i)).toBeInTheDocument();
    });

    it('displays market cap statistic', () => {
      renderWithTheme();

      expect(screen.getByText(/market cap/i)).toBeInTheDocument();
      expect(screen.getByText(/2\.75T/i)).toBeInTheDocument();
    });

    it('displays P/E ratio', () => {
      renderWithTheme();

      expect(screen.getByText(/P\/E ratio/i)).toBeInTheDocument();
      expect(screen.getByText(/28\.4/i)).toBeInTheDocument();
    });

    it('displays dividend yield', () => {
      renderWithTheme();

      expect(screen.getByText(/dividend yield/i)).toBeInTheDocument();
      expect(screen.getByText(/0\.52%/i)).toBeInTheDocument();
    });

    it('displays 52-week high and low', () => {
      renderWithTheme();

      expect(screen.getByText(/52W high/i)).toBeInTheDocument();
      expect(screen.getByText(/\$199\.62/i)).toBeInTheDocument();
      expect(screen.getByText(/52W low/i)).toBeInTheDocument();
      expect(screen.getByText(/\$124\.17/i)).toBeInTheDocument();
    });

    it('displays beta value', () => {
      renderWithTheme();

      expect(screen.getByText(/beta/i)).toBeInTheDocument();
      expect(screen.getByText(/1\.28/i)).toBeInTheDocument();
    });
  });

  describe('Price Change Indicators', () => {
    it('shows green color for positive price change', () => {
      renderWithTheme();

      const priceChange = screen.getByText(/\+2\.34/i);
      expect(priceChange).toHaveStyle({ color: 'rgb(46, 125, 50)' }); // success.main
    });

    it('shows red color for negative price change', () => {
      // Mock negative change scenario
      renderWithTheme('AAPL');

      const priceChange = screen.getByText(/-1\.23/i);
      expect(priceChange).toHaveStyle({ color: 'rgb(211, 47, 47)' }); // error.main
    });

    it('renders trending up icon for positive change', () => {
      renderWithTheme();

      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    });

    it('renders trending down icon for negative change', () => {
      renderWithTheme('AAPL');

      expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders back button', () => {
      renderWithTheme();

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('back button has correct icon', () => {
      renderWithTheme();

      expect(screen.getByTestId('back-icon')).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', () => {
      const { container } = renderWithTheme();

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Tabs Section', () => {
    it('renders tabs navigation', () => {
      renderWithTheme();

      expect(
        screen.getByRole('tab', { name: /price chart/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /AI analysis/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /news/i })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /financials/i })
      ).toBeInTheDocument();
    });

    it('price chart tab is active by default', () => {
      renderWithTheme();

      const priceChartTab = screen.getByRole('tab', { name: /price chart/i });
      expect(priceChartTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to AI Analysis tab when clicked', () => {
      renderWithTheme();

      const aiTab = screen.getByRole('tab', { name: /AI analysis/i });
      fireEvent.click(aiTab);

      expect(aiTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to News tab when clicked', () => {
      renderWithTheme();

      const newsTab = screen.getByRole('tab', { name: /news/i });
      fireEvent.click(newsTab);

      expect(newsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to Financials tab when clicked', () => {
      renderWithTheme();

      const financialsTab = screen.getByRole('tab', { name: /financials/i });
      fireEvent.click(financialsTab);

      expect(financialsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Price Chart Tab', () => {
    it('displays price history heading', () => {
      renderWithTheme();

      expect(screen.getByText(/price history \(7 days\)/i)).toBeInTheDocument();
    });

    it('renders chart placeholder for prototype', () => {
      renderWithTheme();

      expect(screen.getByText(/chart coming soon/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('renders in mobile viewport', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;
      global.dispatchEvent(new Event('resize'));

      renderWithTheme();

      expect(screen.getByText(/MSFT/i)).toBeInTheDocument();
    });

    it('applies correct grid layout styling', () => {
      renderWithTheme();

      const container = document.querySelector('.MuiGrid-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithTheme();

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('tabs have proper ARIA attributes', () => {
      renderWithTheme();

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('back button is keyboard accessible', () => {
      renderWithTheme();

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Firebase Integration', () => {
    it('fetches stock data from Firestore on mount', async () => {
      const { getDoc } = require('firebase/firestore');

      renderWithTheme();

      await waitFor(() => {
        expect(getDoc).toHaveBeenCalled();
      });
    });

    it('handles Firestore errors gracefully', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockRejectedValue(new Error('Firestore error'));

      renderWithTheme();

      await waitFor(() => {
        expect(
          screen.getByText(/error loading stock data/i)
        ).toBeInTheDocument();
      });
    });
  });
});
