import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useAuth } from '../components/layout/AuthContext';
import useAdminMetrics from './useAdminMetrics';

jest.mock('../components/layout/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({} as any)),
  doc: jest.fn(() => ({} as any)),
  getCountFromServer: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn((n: number) => ({ __limit: n } as any)),
  query: jest.fn((col: any, lim: any) => ({ col, lim } as any)),
  onSnapshot: jest.fn((ref: any, next: any) => {
    next({ data: () => ({}) });
    return jest.fn();
  }),
  setDoc: jest.fn(),
}));

jest.mock('../firebase/firebase', () => ({
  db: {} as any,
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

let latestHookValue: ReturnType<typeof useAdminMetrics> | null = null;

function HookTester() {
  const value = useAdminMetrics();
  React.useEffect(() => {
    latestHookValue = value;
  }, [value]);
  return null;
}

describe('useAdminMetrics', () => {
  beforeEach(() => {
    latestHookValue = null;
    jest.clearAllMocks();
  });

  it('returns default values and stops loading for non-admin users', async () => {
    mockedUseAuth.mockReturnValue({
      user: { uid: 'u1', email: 'test@example.com' } as any,
      isAdmin: false,
    });

    render(<HookTester />);

    await waitFor(() => {
      expect(latestHookValue).not.toBeNull();
      expect(latestHookValue!.loading).toBe(false);
    });

    expect(latestHookValue!.metrics).toEqual({
      totalUsers: null,
      totalWatchlistItems: null,
      avgWatchlistSize: null,
      topTickers: [],
    });

    expect(latestHookValue!.flags).toEqual({
      maintenanceMode: false,
      experimentalCharts: false,
    });

    expect(latestHookValue!.error).toBeNull();
  });

  it('loads metrics for admin users (happy path)', async () => {
    const {
      getCountFromServer,
      getDocs,
    } = require('firebase/firestore') as typeof import('firebase/firestore');

    mockedUseAuth.mockReturnValue({
      user: { uid: 'admin1', email: 'admin@example.com' } as any, isAdmin: true,
    });

    (getCountFromServer as jest.Mock).mockResolvedValue({
      data: () => ({ count: 3 }),
    });

    const fakeSnap = {
      forEach: (cb: (doc: any) => void) => {
        cb({ data: () => ({ watchlist: ['AAPL', 'TSLA'] }) });
        cb({ data: () => ({ watchlist: ['AAPL'] }) });
        cb({ data: () => ({ watchlist: [] }) });
      },
    };
    (getDocs as jest.Mock).mockResolvedValue(fakeSnap);

    render(<HookTester />);

    await waitFor(() => {
      expect(latestHookValue).not.toBeNull();
      expect(latestHookValue!.loading).toBe(false);
    });

    expect(latestHookValue!.error).toBeNull();
    expect(latestHookValue!.metrics.totalUsers).toBe(3);
    expect(latestHookValue!.metrics.totalWatchlistItems).toBe(3);
    expect(latestHookValue!.metrics.avgWatchlistSize).toBe(1);
    expect(latestHookValue!.metrics.topTickers).toEqual([
      { ticker: 'AAPL', count: 2 },
      { ticker: 'TSLA', count: 1 },
    ]);
  });
});
