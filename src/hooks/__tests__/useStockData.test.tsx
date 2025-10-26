import { renderHook, waitFor } from '@testing-library/react';
import { useStockData } from '../useStockData'; // Import at the top

// Mock Firestore client and the db export before importing the hook
jest.mock('firebase/firestore', () => {
  const fns = {
    collection: jest.fn((db: unknown, ...path: string[]) => ({
      path: path.join('/'),
    })),
    doc: jest.fn((db: unknown, ...path: string[]) => ({
      path: path.join('/'),
    })),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    orderBy: jest.fn(),
    limitToLast: jest.fn(),
    documentId: jest.fn(),
    query: jest.fn(),
  };
  return fns;
});

// Mock your firebase db singleton to a dummy object
jest.mock('../../firebase/firebase', () => ({
  db: {} as unknown,
}));

/**
 * Build a fake getDocs snapshot
 */
function makePriceSnapshot(
  docs: Array<{ id: string; data: Record<string, unknown> }>
) {
  return {
    empty: docs.length === 0,
    docs: docs.map((d) => ({
      id: d.id,
      data: () => d.data,
    })),
  };
}

describe('useStockData (Firestore-only, KeyStatistics fields)', () => {
  const firestore = require('firebase/firestore');
  const getDoc = firestore.getDoc as jest.Mock;
  const getDocs = firestore.getDocs as jest.Mock;

  beforeEach(() => {
    // jest.resetModules(); // Let's remove this
    jest.clearAllMocks(); // This is sufficient for cleaning up mocks
  });

  test('loads metadata from stocks/{symbol} and computes 52W high/low', async () => {
    // Arrange Firestore mocks
    // Root metadata doc exists
    getDoc.mockImplementation(async (ref: { path: string }) => {
      if (ref.path === 'stocks/AAPL') {
        return {
          exists: () => true,
          data: () => ({
            companyName: 'Apple Inc.',
            sector: 'Technology',
            marketCap: 2750000000000, // 2.75T
          }),
        };
      }
      // profile fallback should not be used
      if (ref.path === 'stocks/AAPL/stats/profile') {
        return { exists: () => false };
      }
      return { exists: () => false };
    });

    // Daily prices for last few days (close values)
    getDocs.mockResolvedValueOnce(
      makePriceSnapshot([
        { id: '2024-10-19', data: { close: 180.12 } },
        { id: '2024-10-20', data: { close: 181.5 } },
        { id: '2024-10-21', data: { close: 178.33 } },
        { id: '2024-10-22', data: { close: 190.0 } }, // high
        { id: '2024-10-23', data: { close: 175.0 } }, // low
      ])
    );

    // No longer need to dynamically import
    // const { useStockData } = await import('../useStockData');

    // Act
    const { result } = renderHook(() => useStockData('AAPL'));

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data).not.toBeNull();

    const data = result.current.data!;
    expect(data.symbol).toBe('AAPL');
    expect(data.companyName).toBe('Apple Inc.');
    expect(data.sector).toBe('Technology');
    expect(data.marketCap).toBe('2.75T');
    expect(data.fiftyTwoWeekHigh).toBe(190.0);
    expect(data.fiftyTwoWeekLow).toBe(175.0);
  });

  test('falls back to stocks/{symbol}/stats/profile when root doc missing', async () => {
    getDoc.mockImplementation(async (ref: { path: string }) => {
      if (ref.path === 'stocks/MSFT') {
        return { exists: () => false };
      }
      if (ref.path === 'stocks/MSFT/stats/profile') {
        return {
          exists: () => true,
          data: () => ({
            companyName: 'Microsoft Corporation',
            sector: 'Technology',
            marketCap: '3.10T',
          }),
        };
      }
      return { exists: () => false };
    });

    getDocs.mockResolvedValueOnce(
      makePriceSnapshot([
        { id: '2024-10-20', data: { price: 410 } },
        { id: '2024-10-21', data: { price: 405 } },
        { id: '2024-10-22', data: { price: 420 } }, // high
        { id: '2024-10-23', data: { price: 395 } }, // low
      ])
    );

    // const { useStockData } = await import('../useStockData');

    const { result } = renderHook(() => useStockData('MSFT'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    const data = result.current.data!;
    expect(data.companyName).toBe('Microsoft Corporation');
    expect(data.sector).toBe('Technology');
    expect(data.marketCap).toBe('3.10T');
    expect(data.fiftyTwoWeekHigh).toBe(420);
    expect(data.fiftyTwoWeekLow).toBe(395);
  });

  test('errors when metadata is missing in both root and profile', async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    getDocs.mockResolvedValueOnce(
      makePriceSnapshot([
        { id: '2024-10-20', data: { close: 100 } },
        { id: '2024-10-21', data: { close: 110 } },
      ])
    );

    // const { useStockData } = await import('../useStockData');

    const { result } = renderHook(() => useStockData('TSLA'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toMatch(/Missing metadata/i);
  });

  test('errors when no valid prices are found', async () => {
    // Metadata ok
    getDoc.mockImplementation(async (ref: { path: string }) => {
      if (ref.path === 'stocks/NVDA') {
        return {
          exists: () => true,
          data: () => ({
            companyName: 'NVIDIA Corporation',
            sector: 'Technology',
            marketCap: 2400000000000,
          }),
        };
      }
      return { exists: () => false };
    });
    // Prices empty
    getDocs.mockResolvedValueOnce(makePriceSnapshot([]));

    // const { useStockData } = await import('../useStockData');

    const { result } = renderHook(() => useStockData('NVDA'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toMatch(/No price data/i);
  });
});
