import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

// The component under test (TDD: this file may be added before implementation).
import StockListingPage from '../StockListingPage';

const renderWithProviders = (ui: React.ReactElement) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            <MemoryRouter>{ui}</MemoryRouter>
        </ThemeProvider>
    );
};

// Mock dataset used by the tests. The real implementation should use the
// same shape as described in the issue so the tests exercise formatting.
const MOCK_STOCKS = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        currentPrice: 175.23,
        predictedPrice: 182.5,
        confidence: 0.87,
        trend: 'up',
        change: 1.8,
        volume: 1234567,
        lastAnalyzed: '2025-10-25T14:23:00Z',
        prediction: 'BUY',
        targetPrice: 190,
        riskLevel: 'Low',
    },
    {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        sector: 'Automotive',
        currentPrice: 254.12,
        predictedPrice: 230.0,
        confidence: 0.56,
        trend: 'down',
        change: -4.3,
        volume: 987654,
        lastAnalyzed: '2025-10-25T12:00:00Z',
        prediction: 'SELL',
        targetPrice: 220,
        riskLevel: 'High',
    },
];

describe('StockListingPage (spec from GitHub issue)', () => {
    test('renders header, title/description, filters, stock grid and footer', async () => {
        // TDD note: StockListingPage should accept `initialStocks` or otherwise
        // render mock data. If implementation differs, update the test to mount
        // the page with the appropriate provider/hooks.
        renderWithProviders(<StockListingPage initialStocks={MOCK_STOCKS} /> as any);

        // Header and Footer are required by acceptance criteria
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByText(/Stock Predictions/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();

        // Sector and Sort controls
        expect(screen.getByLabelText(/sector/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sort/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /more filters/i })).toBeInTheDocument();

        // Grid / cards
        const grid = screen.getByTestId('stock-grid');
        expect(grid).toBeInTheDocument();

        // Each mock stock should appear as a card with symbol + name
        for (const s of MOCK_STOCKS) {
            const card = within(grid).getByTestId(`stock-card-${s.symbol}`);
            expect(card).toBeInTheDocument();
            expect(within(card).getByText(s.symbol)).toBeInTheDocument();
            expect(within(card).getByText(s.name)).toBeInTheDocument();
            // sector badge
            expect(within(card).getByText(s.sector)).toBeInTheDocument();
            // current/predicted price and prediction badge
            expect(within(card).getByText(new RegExp(String(s.currentPrice)))).toBeInTheDocument();
            expect(within(card).getByText(new RegExp(String(s.predictedPrice)))).toBeInTheDocument();
            expect(within(card).getByText(new RegExp(s.prediction, 'i'))).toBeInTheDocument();
            // confidence progressbar
            expect(within(card).getByRole('progressbar')).toBeInTheDocument();
        }
    });

    test('search, sector filter and sort update displayed stocks', async () => {
        const user = userEvent.setup();
        renderWithProviders(<StockListingPage initialStocks={MOCK_STOCKS} /> as any);

        const search = screen.getByPlaceholderText(/search/i);
        await user.type(search, 'Tesla');
        // only TSLA should be visible
        const grid = screen.getByTestId('stock-grid');
        expect(within(grid).queryByTestId('stock-card-AAPL')).not.toBeInTheDocument();
        expect(within(grid).getByTestId('stock-card-TSLA')).toBeInTheDocument();

        // Reset search
        await user.clear(search);

        // Sector filter -> Automotive (should show TSLA only)
        const sector = screen.getByLabelText(/sector/i);
        await user.selectOptions(sector, 'Automotive');
        expect(within(grid).queryByTestId('stock-card-AAPL')).not.toBeInTheDocument();
        expect(within(grid).getByTestId('stock-card-TSLA')).toBeInTheDocument();

        // Sort by accuracy/confidence: AAPL should be before TSLA when sorting desc
        const sort = screen.getByLabelText(/sort/i);
        await user.selectOptions(sort, 'confidence-desc');
        const cards = within(grid).getAllByTestId(/stock-card-/i);
        expect(cards[0]).toHaveAttribute('data-testid', 'stock-card-AAPL');
    });

    test('clicking a stock card dispatches navigate event to detail page', async () => {
        const user = userEvent.setup();
        renderWithProviders(<StockListingPage initialStocks={MOCK_STOCKS} /> as any);

        const navHandler = jest.fn();
        window.addEventListener('navigate', (e: Event) => {
            // CustomEvent detail is where the page and symbol are expected
            // @ts-ignore - test-time cast
            navHandler((e as CustomEvent).detail);
        });

        const grid = screen.getByTestId('stock-grid');
        const card = within(grid).getByTestId('stock-card-AAPL');
        await user.click(card);

        expect(navHandler).toHaveBeenCalled();
        expect(navHandler.mock.calls[0][0]).toEqual({ page: 'stock-detail', stockSymbol: 'AAPL' });
    });

    test('empty state message displays when no matches', async () => {
        const user = userEvent.setup();
        renderWithProviders(<StockListingPage initialStocks={MOCK_STOCKS} /> as any);

        const search = screen.getByPlaceholderText(/search/i);
        await user.type(search, 'NO-SUCH-STOCK-XYZ');

        expect(screen.getByText(/No stocks found matching your criteria/i)).toBeInTheDocument();
    });
});
