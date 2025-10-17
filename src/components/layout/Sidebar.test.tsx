/**
 * @fileoverview Test suite for Sidebar navigation component
 * Tests Material UI Drawer-based sidebar with React Router,
 * responsive behavior, navigation, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';

// Mock Material UI icons
jest.mock('@mui/icons-material/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-icon">Dashboard Icon</div>,
}));
jest.mock('@mui/icons-material/Moving', () => ({
  __esModule: true,
  default: () => <div data-testid="predictions-icon">Predictions Icon</div>,
}));
jest.mock('@mui/icons-material/Bookmarks', () => ({
  __esModule: true,
  default: () => <div data-testid="watchlist-icon">Watchlist Icon</div>,
}));
jest.mock('@mui/icons-material/Settings', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-icon">Settings Icon</div>,
}));

// Helper function to render component with theme and router
const renderWithTheme = (component: React.ReactElement, initialRoute = '/') => {
  const theme = createTheme();
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </MemoryRouter>
  );
};

describe('Sidebar Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sidebar with all menu items', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Predictions')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Watchlist')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Settings')[0]).toBeInTheDocument();
    });

    it('renders correct icons for each menu item', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      expect(screen.getAllByTestId('dashboard-icon')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('predictions-icon')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('watchlist-icon')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('settings-icon')[0]).toBeInTheDocument();
    });

    it('applies correct styling to active menu item', () => {
      renderWithTheme(<Sidebar {...defaultProps} />, '/predictions');

      const predictionsButtons = screen.getAllByRole('link', {
        name: /predictions/i,
      });
      expect(predictionsButtons[0]).toHaveAttribute('aria-current', 'page');
    });

    it('renders Material UI Drawer component', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const drawer = document.querySelector('.MuiDrawer-paper');
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders links with correct paths', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const dashboardLinks = screen.getAllByRole('link', {
        name: /dashboard/i,
      });
      const predictionsLinks = screen.getAllByRole('link', {
        name: /predictions/i,
      });
      const watchlistLinks = screen.getAllByRole('link', {
        name: /watchlist/i,
      });
      const settingsLinks = screen.getAllByRole('link', { name: /settings/i });

      expect(dashboardLinks[0]).toHaveAttribute('href', '/');
      expect(predictionsLinks[0]).toHaveAttribute('href', '/predictions');
      expect(watchlistLinks[0]).toHaveAttribute('href', '/watchlist');
      expect(settingsLinks[0]).toHaveAttribute('href', '/settings');
    });

    it('calls onClose when menu item is clicked', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Sidebar {...defaultProps} onClose={mockOnClose} />);

      const dashboardLinks = screen.getAllByRole('link', {
        name: /dashboard/i,
      });
      fireEvent.click(dashboardLinks[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('highlights active route', () => {
      renderWithTheme(<Sidebar {...defaultProps} />, '/watchlist');

      const watchlistLinks = screen.getAllByRole('link', {
        name: /watchlist/i,
      });
      expect(watchlistLinks[0]).toHaveAttribute('aria-current', 'page');

      const dashboardLinks = screen.getAllByRole('link', {
        name: /dashboard/i,
      });
      expect(dashboardLinks[0]).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Responsive Behavior', () => {
    it('renders permanent drawer visible on desktop', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const permanentDrawer = document.querySelector('.MuiDrawer-docked');
      expect(permanentDrawer).toBeInTheDocument();
    });

    it('renders temporary drawer for mobile', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const drawers = document.querySelectorAll('.MuiDrawer-root');
      expect(drawers.length).toBeGreaterThanOrEqual(2);
    });

    it('handles open/close state for mobile drawer', () => {
      const theme = createTheme();
      const { rerender } = render(
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <Sidebar {...defaultProps} open={false} />
          </ThemeProvider>
        </MemoryRouter>
      );

      let modal = document.querySelector('.MuiModal-root');
      expect(modal).toBeInTheDocument();

      rerender(
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <Sidebar {...defaultProps} open={true} />
          </ThemeProvider>
        </MemoryRouter>
      );
      modal = document.querySelector('.MuiModal-root');
      expect(modal).toBeInTheDocument();
    });

    it('applies correct width styling', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const drawerPaper = document.querySelector('.MuiDrawer-paper');
      expect(drawerPaper).toHaveStyle('width: 240px');
    });
  });

  describe('Accessibility', () => {
    it('has focusable menu items', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const menuLinks = screen.getAllByRole('link');
      menuLinks.forEach((link) => {
        expect(link).toHaveAttribute('tabindex', '0');
      });
    });

    it('has proper ARIA attributes for selected state', () => {
      renderWithTheme(<Sidebar {...defaultProps} />, '/settings');

      const settingsLinks = screen.getAllByRole('link', { name: /settings/i });
      expect(settingsLinks[0]).toHaveAttribute('aria-current', 'page');

      const dashboardLinks = screen.getAllByRole('link', {
        name: /dashboard/i,
      });
      expect(dashboardLinks[0]).not.toHaveAttribute('aria-current');
    });

    it('provides proper link labels', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      expect(
        screen.getAllByRole('link', { name: /dashboard/i })[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('link', { name: /predictions/i })[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('link', { name: /watchlist/i })[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('link', { name: /settings/i })[0]
      ).toBeInTheDocument();
    });
  });
});
