import { renderHook, waitFor } from '@testing-library/react';

/**
 * Test setup:
 * - Mock Firebase db module used by the hook file.
 * - Mock constants/tickers to keep the test dataset tiny.
 * - Mock Firestore SDK surface used by the hooks.
 */
jest.mock('../firebase/firebase', () => ({ db: {} }));

jest.mock('../constants/tickers', () => ({
  __esModule: true,
  TICKERS: ['AAPL', 'MSFT'],
}));

const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();

jest.mock('firebase/firestore', () => {
  const collection = (_db: unknown, ...path: string[]) => ({
    type: 'collection',
    path,
  });
  const doc = (_db: unknown, ...path: string[]) => ({ type: 'doc', path });
  const query = (...args: unknown[]) => ({ type: 'query', args });

  return {
    __esModule: true,
    collection,
    doc,
    query,
    getDoc: mockGetDoc,
    getDocs: mockGetDocs,
  };
});

// Import after mocks so the module picks up mocked deps
const { useStockSummaryDoc, usePriceHistory } = require('./useStockData');

/**
 * Minimal Firestore snapshot helpers for tests.
 */
function makeDocSnap({
  exists = true,
  id = '',
  data = {},
}: {
  exists?: boolean;
  id?: string;
  data?: any;
}) {
  return {
    id,
    exists: () => exists,
    data: () => data,
  };
}

function makeQuerySnap(docs: Array<{ id: string; data: any }>) {
  return {
    empty: docs.length === 0,
    docs: docs.map((d) => makeDocSnap({ id: d.id, data: d.data })),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

/* -------------------------------------------------------------------------- */
/*                             useStockSummaryDoc                              */
/* -------------------------------------------------------------------------- */

test('useStockSummaryDoc returns normalized stock summary for a symbol', async () => {
  mockGetDoc.mockImplementation((ref: any) => {
    const p = ref.path;
    if (p[0] === 'stocks' && p[1] === 'AAPL') {
      return Promise.resolve(
        makeDocSnap({
          data: {
            address1: 'One Apple Park Way',
            change24hPercent: 2.3,
            city: 'Cupertino',
            companyName: 'Apple Inc.',
            country: 'United States',
            currentPrice: 268.81,
            dividendYield: 0.004,
            dividendYieldPercent: 0.4,
            fiftyTwoWeekHigh: 269.08,
            fiftyTwoWeekLow: 169.21,
            industry: 'Consumer Electronics',
            marketCap: 3989245001728,
            open: 264.88,
            peRatio: 40.72,
            sector: 'Technology',
            state: 'CA',
            updatedAt: Date.now(),
            volume: 44620772,
            website: 'https://www.apple.com',
            zip: '95014',
          },
        })
      );
    }
    return Promise.resolve(makeDocSnap({ exists: false }));
  });

  const { result } = renderHook(() => useStockSummaryDoc('AAPL'));
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBeNull();
  expect(result.current.data?.symbol).toBe('AAPL');
  expect(result.current.data?.companyName).toBe('Apple Inc.');
  expect(result.current.data?.currentPrice).toBe(268.81);
});

/* -------------------------------------------------------------------------- */
/*                                   Edge cases                                */
/* -------------------------------------------------------------------------- */

test('hooks handle falsy symbol by returning null data without error', async () => {
  const summary = renderHook(() => useStockSummaryDoc(''));
  const history = renderHook(() => usePriceHistory(undefined));

  await waitFor(() => {
    expect(summary.result.current.loading).toBe(false);
    expect(history.result.current.loading).toBe(false);
  });

  expect(summary.result.current.data).toBeNull();
  expect(history.result.current.data).toBeNull();

  expect(summary.result.current.error).toBeNull();
  expect(history.result.current.error).toBeNull();
});
