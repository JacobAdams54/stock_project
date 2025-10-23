/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock firebase/firestore functions used by the component
const mockGetDocs = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockTimestamp = { fromDate: jest.fn((d) => d) };

jest.mock('firebase/firestore', () => ({
    collection: (...args: any[]) => mockCollection(...args),
    query: (...args: any[]) => mockQuery(...args),
    where: (...args: any[]) => mockWhere(...args),
    orderBy: (...args: any[]) => mockOrderBy(...args),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    Timestamp: mockTimestamp,
}));

import StockChart from './StockChart';

describe('StockChart (integration expectations)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('shows loading spinner, then renders chart heading when data is returned', async () => {
        // mock a single doc with timestamp and price
        mockGetDocs.mockResolvedValueOnce({ docs: [{ data: () => ({ timestamp: { toDate: () => new Date() }, price: 123.45 }) }] });

        render(<StockChart ticker="AAPL" range="1M" />);

        // loading spinner should appear
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        // wait for getDocs to be called and loading to finish
        await waitFor(() => expect(mockGetDocs).toHaveBeenCalled());

        // title should render using the ticker
        expect(screen.getByText(/AAPL Stock Performance/i)).toBeInTheDocument();

        // data-driven content: the fallback 'No data available' should not be present
        expect(screen.queryByText(/no data available/i)).not.toBeInTheDocument();
    });

    test('shows empty state when Firestore returns no documents', async () => {
        mockGetDocs.mockResolvedValueOnce({ docs: [] });

        render(<StockChart ticker="TSLA" range="1W" />);

        // still shows loading initially
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        await waitFor(() => expect(mockGetDocs).toHaveBeenCalled());

        // should show the empty message
        expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });

    test('shows error state when Firestore query fails', async () => {
        mockGetDocs.mockRejectedValueOnce(new Error('permission denied'));

        render(<StockChart ticker="MSFT" range="1M" />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        await waitFor(() => expect(mockGetDocs).toHaveBeenCalled());

        expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
    });

    test('changing the range triggers a new Firestore query', async () => {
        // first call returns data
        mockGetDocs.mockResolvedValueOnce({ docs: [{ data: () => ({ timestamp: { toDate: () => new Date() }, price: 10 }) }] });
        // second call returns data as well
        mockGetDocs.mockResolvedValueOnce({ docs: [{ data: () => ({ timestamp: { toDate: () => new Date() }, price: 11 }) }] });

        render(<StockChart ticker="GOOG" range="1M" />);

        await waitFor(() => expect(mockGetDocs).toHaveBeenCalledTimes(1));

        // find toggle button for 1W and click it
        const btn = screen.getByRole('button', { name: '1W' });
        fireEvent.click(btn);

        // component should call getDocs again for the new range
        await waitFor(() => expect(mockGetDocs).toHaveBeenCalledTimes(2));
    });
});
