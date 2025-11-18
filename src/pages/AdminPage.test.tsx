import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AdminPage from './AdminPage';
import { useAuth } from '../components/layout/AuthContext';
import useAdminMetrics from '../hooks/useAdminMetrics';
import { logAppEvent } from '../firebase/firebase';

// --- Mocks ---

jest.mock('../components/layout/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../hooks/useAdminMetrics');

jest.mock('../components/layout/Sidebar', () => () => (
  <div data-testid="sidebar">Sidebar</div>
));

jest.mock('../firebase/firebase', () => ({
  logAppEvent: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseAdminMetrics = useAdminMetrics as jest.MockedFunction<
  typeof useAdminMetrics
>;
const mockedLogAppEvent = logAppEvent as jest.MockedFunction<
  typeof logAppEvent
>;

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows restricted message for non-admin users', () => {
    mockedUseAuth.mockReturnValue({
      user: { uid: 'user1', email: 'user@example.com' } as any,
      isAdmin: false,
    });

    mockedUseAdminMetrics.mockReturnValue({
      metrics: {
        totalUsers: null,
        totalWatchlistItems: null,
        avgWatchlistSize: null,
        topTickers: [],
      },
      flags: {
        maintenanceMode: false,
        experimentalCharts: false,
      },
      setFlag: jest.fn(),
      loading: false,
      error: null,
    } as any);

    render(<AdminPage />);

    // More specific: heading named "Admin"
    expect(
      screen.getByRole('heading', { name: /^Admin$/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/Access restricted/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You need admin privileges to view this page\./i)
    ).toBeInTheDocument();
  });

  it('renders dashboard for admin user and logs test event', async () => {
    mockedUseAuth.mockReturnValue({
      user: { uid: 'admin1', email: 'admin@example.com' } as any,
      isAdmin: true,
    });

    mockedUseAdminMetrics.mockReturnValue({
      metrics: {
        totalUsers: 5,
        totalWatchlistItems: 20,
        avgWatchlistSize: 4,
        topTickers: [{ ticker: 'AAPL', count: 3 }],
      },
      flags: {
        maintenanceMode: true,
        experimentalCharts: false,
      },
      setFlag: jest.fn(),
      loading: false,
      error: null,
    } as any);

    const user = userEvent.setup();

    render(<AdminPage />);

    expect(
      screen.getByRole('heading', { name: /Admin Dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Total users/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();

    // Accessible name is from aria-label: "Log test analytics event"
    const btn = screen.getByRole('button', {
      name: /log test analytics event/i,
    });
    await user.click(btn);

    expect(mockedLogAppEvent).toHaveBeenCalledTimes(1);
    expect(mockedLogAppEvent).toHaveBeenCalledWith(
      'admin_test_click',
      expect.any(Object)
    );
  });
});
