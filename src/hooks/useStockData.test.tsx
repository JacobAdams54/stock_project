import { renderHook, waitFor } from '@testing-library/react';

// REMOVE the early static import of hooks
// import {
//   useStockMetadata,
//   useStockData,
//   useStockHistory,
//   useStocksList,
// } from './useStockData';

// Mock the db module used by the hook file (match the hook's import path)
jest.mock('../firebase/firebase', () => ({
  db: {},
}));

// Mock Firestore SDK (minimal surface used by the hooks)
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();

jest.mock('firebase/firestore', () => {
  const collection = (_db: unknown, ...path: string[]) => ({
    type: 'collection',
    path,
  });
  const doc = (_db: unknown, ...path: string[]) => ({ type: 'doc', path });
  const orderBy = (...args: unknown[]) => ({ type: 'orderBy', args });
  const limitToLast = (n: number) => ({ type: 'limitToLast', n });
  const documentId = () => ({ type: 'documentId' });
  const query = (...args: unknown[]) => ({ type: 'query', args });

  return {
    __esModule: true,
    collection,
    doc,
    orderBy,
    limitToLast,
    documentId,
    query,
    getDoc: mockGetDoc,
    getDocs: mockGetDocs,
  };
});

// Import hooks AFTER mocks so they see the mocked modules
const {
  useStockMetadata,
  useStockData,
  useStockHistory,
  useStocksList,
} = require('./useStockData');

/**
 * Creates a minimal Firestore DocumentSnapshot-like mock for tests.
 * Useful for stubbing getDoc results without importing Firestore types.
 * @param {Object} params - Snapshot options.
 * @param {boolean} [params.exists=true] - Whether exists() should return true.
 * @param {string} [params.id=''] - Document identifier exposed as id.
 * @param {any} [params.data={}] - Payload returned by data().
 * @returns {{ id: string; exists: () => boolean; data: () => any }} Mock snapshot object.
 * @example
 * const snap = makeDocSnap({ id: 'AAPL', data: { companyName: 'Apple' } });
 * expect(snap.exists()).toBe(true);
 * expect(snap.data().companyName).toBe('Apple');
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

/**
 * Creates a minimal Firestore QuerySnapshot-like mock for tests.
 * Useful for stubbing getDocs results without importing Firestore types.
 * @param {Array<{ id: string; data: any }>} docs - Raw document entries used to build the snapshot.
 * @returns {{ empty: boolean; docs: Array<{ id: string; exists: () => boolean; data: () => any }> }} Mock query snapshot object.
 * @example
 * const snap = makeQuerySnap([{ id: 'AAPL', data: { c: 100 } }]);
 * expect(snap.empty).toBe(false);
 * expect(snap.docs[0].id).toBe('AAPL');
 * expect(snap.docs[0].data().c).toBe(100);
 */
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
/*                                useStockMetadata                             */
/* -------------------------------------------------------------------------- */

test('useStockMetadata returns metadata from root doc', async () => {
  // Root doc exists, profile doc does not.
  mockGetDoc.mockImplementation((ref: any) => {
    const p = ref.path;
    if (p[0] === 'stocks' && p.length === 2 && p[1] === 'AAPL') {
      return Promise.resolve(
        makeDocSnap({
          data: {
            companyName: 'Apple Inc.',
            sector: 'Technology',
            marketCap: 2000000000000,
          },
        })
      );
    }
    if (
      p[0] === 'stocks' &&
      p[1] === 'AAPL' &&
      p[2] === 'stats' &&
      p[3] === 'profile'
    ) {
      return Promise.resolve(makeDocSnap({ exists: false }));
    }
    return Promise.resolve(makeDocSnap({ exists: false }));
  });

  const { result } = renderHook(() => useStockMetadata('AAPL'));
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBeNull();
  expect(result.current.data).toEqual({
    companyName: 'Apple Inc.',
    sector: 'Technology',
    // marketCap formatted like "2.00T"
    marketCap: expect.stringMatching(/T|B|M|K|\d/),
  });
});

test('useStockMetadata falls back to stats/profile doc', async () => {
  mockGetDoc.mockImplementation((ref: any) => {
    const p = ref.path;
    if (p[0] === 'stocks' && p.length === 2 && p[1] === 'MSFT') {
      return Promise.resolve(makeDocSnap({ exists: false }));
    }
    if (
      p[0] === 'stocks' &&
      p[1] === 'MSFT' &&
      p[2] === 'stats' &&
      p[3] === 'profile'
    ) {
      return Promise.resolve(
        makeDocSnap({
          data: {
            companyName: 'Microsoft',
            sector: 'Technology',
            marketCap: 1800000000000,
          },
        })
      );
    }
    return Promise.resolve(makeDocSnap({ exists: false }));
  });

  const { result } = renderHook(() => useStockMetadata('MSFT'));
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBeNull();
  expect(result.current.data?.companyName).toBe('Microsoft');
});

test('useStockMetadata surfaces error when no valid metadata found', async () => {
  mockGetDoc.mockResolvedValue(makeDocSnap({ exists: false }));

  const { result } = renderHook(() => useStockMetadata('ZZZZ'));
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeInstanceOf(Error);
});

/* -------------------------------------------------------------------------- */
/*                                  useStockData                               */
/* -------------------------------------------------------------------------- */

test('useStockData returns metadata + price summary', async () => {
  // Metadata for AAPL
  mockGetDoc.mockImplementation((ref: any) => {
    const p = ref.path;
    if (p[0] === 'stocks' && p.length === 2 && p[1] === 'AAPL') {
      return Promise.resolve(
        makeDocSnap({
          data: {
            companyName: 'Apple Inc.',
            sector: 'Technology',
            marketCap: 2000000000000,
          },
        })
      );
    }
    return Promise.resolve(makeDocSnap({ exists: false }));
  });

  // Price history for AAPL (ascending by date ID)
  mockGetDocs.mockImplementation((arg: any) => {
    if (arg?.type === 'query') {
      const col = arg.args.find((a: any) => a?.type === 'collection');
      const path = col?.path || [];
      if (path[0] === 'prices' && path[1] === 'AAPL' && path[2] === 'daily') {
        return Promise.resolve(
          makeQuerySnap([
            { id: '2020-10-19', data: { c: 100, h: 101, l: 99 } },
            { id: '2020-10-20', data: { c: 105, h: 106, l: 102 } },
            { id: '2020-10-21', data: { c: 103, h: 107, l: 98 } },
          ])
        );
      }
    }
    return Promise.resolve(makeQuerySnap([]));
  });

  const { result } = renderHook(() => useStockData('AAPL'));
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBeNull();
  expect(result.current.data?.symbol).toBe('AAPL');
  expect(result.current.data?.companyName).toBe('Apple Inc.');
  expect(result.current.data?.fiftyTwoWeekHigh).toBe(107);
  expect(result.current.data?.fiftyTwoWeekLow).toBe(98);
  expect(result.current.data?.currentPrice).toBe(103);
  expect(result.current.data?.change).toBe(103 - 105);
  expect(result.current.data?.changePercent).toBeCloseTo(
    ((103 - 105) / 105) * 100,
    6
  );
});

/* -------------------------------------------------------------------------- */
/*                               useStockHistory                               */
/* -------------------------------------------------------------------------- */

test('useStockHistory returns normalized OHLCV bars', async () => {
  mockGetDocs.mockImplementation((arg: any) => {
    if (arg?.type === 'query') {
      const col = arg.args.find((a: any) => a?.type === 'collection');
      const path = col?.path || [];
      if (path[0] === 'prices' && path[1] === 'TSLA' && path[2] === 'daily') {
        return Promise.resolve(
          makeQuerySnap([
            // Missing o/h/l should fall back to close
            { id: '2020-10-19', data: { c: 200 } },
            // Has explicit o/h/l/v
            {
              id: '2020-10-20',
              data: { c: 210, o: 205, h: 215, l: 204, v: 123456 },
            },
          ])
        );
      }
    }
    return Promise.resolve(makeQuerySnap([]));
  });

  const { result } = renderHook(() => useStockHistory('TSLA'));
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBeNull();
  expect(result.current.data).toEqual([
    { t: '2020-10-19', o: 200, h: 200, l: 200, c: 200, v: undefined },
    { t: '2020-10-20', o: 205, h: 215, l: 204, c: 210, v: 123456 },
  ]);
});

/* -------------------------------------------------------------------------- */
/*                                useStocksList                                */
/* -------------------------------------------------------------------------- */

test('useStocksList returns all symbols with metadata', async () => {
  mockGetDocs.mockImplementation((arg: any) => {
    if (arg?.type === 'collection' && arg.path[0] === 'stocks') {
      return Promise.resolve({
        empty: false,
        docs: [{ id: 'AAPL' }, { id: 'MSFT' }],
      });
    }
    return Promise.resolve(makeQuerySnap([]));
  });

  mockGetDoc.mockImplementation((ref: any) => {
    const p = ref.path;
    if (p[0] === 'stocks' && p.length === 2 && p[1] === 'AAPL') {
      return Promise.resolve(
        makeDocSnap({
          data: {
            companyName: 'Apple Inc.',
            sector: 'Technology',
            marketCap: 2000000000000,
          },
        })
      );
    }
    if (p[0] === 'stocks' && p.length === 2 && p[1] === 'MSFT') {
      return Promise.resolve(
        makeDocSnap({
          data: {
            companyName: 'Microsoft',
            sector: 'Technology',
            marketCap: 1800000000000,
          },
        })
      );
    }
    return Promise.resolve(makeDocSnap({ exists: false }));
  });

  const { result } = renderHook(() => useStocksList());
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBeNull();
  expect(result.current.data).toEqual([
    {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      sector: 'Technology',
      marketCap: expect.stringMatching(/T|B|M|K|\d/),
    },
    {
      symbol: 'MSFT',
      companyName: 'Microsoft',
      sector: 'Technology',
      marketCap: expect.stringMatching(/T|B|M|K|\d/),
    },
  ]);
});

/* -------------------------------------------------------------------------- */
/*                                  Edge cases                                 */
/* -------------------------------------------------------------------------- */

test('hooks handle falsy symbol by returning null data without error', async () => {
  const meta = renderHook(() => useStockMetadata(''));
  const detail = renderHook(() => useStockData(undefined));
  const hist = renderHook(() => useStockHistory('   '));

  await waitFor(() => {
    expect(meta.result.current.loading).toBe(false);
    expect(detail.result.current.loading).toBe(false);
    expect(hist.result.current.loading).toBe(false);
  });

  expect(meta.result.current.data).toBeNull();
  expect(detail.result.current.data).toBeNull();
  expect(hist.result.current.data).toBeNull();

  expect(meta.result.current.error).toBeNull();
  expect(detail.result.current.error).toBeNull();
  expect(hist.result.current.error).toBeNull();
});
