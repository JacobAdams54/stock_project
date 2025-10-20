/**
 * @fileoverview Test suite for Sidebar navigation component
<<<<<<< HEAD
 * Tests Material UI Drawer-based sidebar with React Router,
 * responsive behavior, navigation, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';
=======
 * Tests Material UI Drawer-based sidebar with responsive behavior,
 * navigation events, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import { Sidebar } from './Sidebar';
>>>>>>> origin/component/Header

// Mock Material UI icons
jest.mock('@mui/icons-material/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-icon">Dashboard Icon</div>,
}));
<<<<<<< HEAD
jest.mock('@mui/icons-material/Moving', () => ({
=======
jest.mock('@mui/icons-material/TrendingUp', () => ({
>>>>>>> origin/component/Header
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

<<<<<<< HEAD
// Helper function to render component with theme and router
const renderWithTheme = (component: React.ReactElement, initialRoute = '/') => {
  const theme = createTheme();
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </MemoryRouter>
  );
=======
// Helper function to render component with Material UI theme
const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
>>>>>>> origin/component/Header
};

describe('Sidebar Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
<<<<<<< HEAD
=======
    activePage: 'dashboard',
>>>>>>> origin/component/Header
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sidebar with all menu items', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

<<<<<<< HEAD
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /predictions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /watchlist/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
=======
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Predictions')).toBeInTheDocument();
      expect(screen.getByText('Watchlist')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
>>>>>>> origin/component/Header
    });

    it('renders correct icons for each menu item', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

<<<<<<< HEAD
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
=======
      expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
      expect(screen.getByTestId('predictions-icon')).toBeInTheDocument();
      expect(screen.getByTestId('watchlist-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('applies correct styling to active menu item', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="predictions" />);

      const predictionsButton = screen.getByRole('button', {
        name: /predictions/i,
      });
      expect(predictionsButton).toHaveAttribute('aria-selected', 'true');
>>>>>>> origin/component/Header
    });

    it('renders Material UI Drawer component', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

<<<<<<< HEAD
=======
      // Check for drawer by looking for MUI Drawer's paper element
>>>>>>> origin/component/Header
      const drawer = document.querySelector('.MuiDrawer-paper');
      expect(drawer).toBeInTheDocument();
    });
  });

<<<<<<< HEAD
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
=======
  describe('Navigation Events', () => {
    it('dispatches custom navigate event when menu item is clicked', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      renderWithTheme(<Sidebar {...defaultProps} />);

      const predictionsButton = screen.getByRole('button', {
        name: /predictions/i,
      });
      fireEvent.click(predictionsButton);

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navigate',
          detail: { page: 'predictions' },
        })
      );
    });

    it('calls onClose when menu item is clicked (mobile behavior)', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(<Sidebar {...defaultProps} onClose={mockOnClose} />);

      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });
      fireEvent.click(dashboardButton);
>>>>>>> origin/component/Header

      expect(mockOnClose).toHaveBeenCalled();
    });

<<<<<<< HEAD
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
=======
    it('dispatches correct page data for each menu item', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      renderWithTheme(<Sidebar {...defaultProps} />);

      // Test each menu item
      const testCases = [
        { buttonName: /dashboard/i, expectedPage: 'dashboard' },
        { buttonName: /predictions/i, expectedPage: 'predictions' },
        { buttonName: /watchlist/i, expectedPage: 'watchlist' },
        { buttonName: /settings/i, expectedPage: 'settings' },
      ];

      testCases.forEach(({ buttonName, expectedPage }) => {
        mockDispatchEvent.mockClear();
        const button = screen.getByRole('button', { name: buttonName });
        fireEvent.click(button);

        expect(mockDispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'navigate',
            detail: { page: expectedPage },
          })
        );
      });
>>>>>>> origin/component/Header
    });
  });

  describe('Responsive Behavior', () => {
<<<<<<< HEAD
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
=======
    it('renders with permanent variant for desktop', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const drawer = document.querySelector('.MuiDrawer-root');
      expect(drawer).toHaveClass('MuiDrawer-permanent');
    });

    it('handles open/close state for mobile drawer', () => {
      renderWithTheme(<Sidebar {...defaultProps} open={false} />);

      const drawer = document.querySelector('.MuiDrawer-paper');
      // When closed, drawer should not be visible (Material UI handles this)
      expect(drawer).toBeInTheDocument();
>>>>>>> origin/component/Header
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

<<<<<<< HEAD
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
=======
      const menuButtons = screen.getAllByRole('button');
      menuButtons.forEach((button) => {
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });

    it('supports keyboard navigation', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      renderWithTheme(<Sidebar {...defaultProps} />);

      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });

      // Simulate Enter key press
      fireEvent.keyDown(dashboardButton, { key: 'Enter', code: 'Enter' });

      // Material UI ListItemButton should handle keyboard events
      expect(dashboardButton).toBeInTheDocument();
    });

    it('has proper ARIA attributes for selected state', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="watchlist" />);

      const watchlistButton = screen.getByRole('button', {
        name: /watchlist/i,
      });
      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });

      expect(watchlistButton).toHaveAttribute('aria-selected', 'true');
      expect(dashboardButton).toHaveAttribute('aria-selected', 'false');
    });

    it('provides proper button labels', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /dashboard/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /predictions/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /watchlist/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /settings/i })
      ).toBeInTheDocument();
    });
  });

  describe('Active State Management', () => {
    it('highlights only the active menu item', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="settings" />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });

      expect(settingsButton).toHaveAttribute('aria-selected', 'true');
      expect(dashboardButton).toHaveAttribute('aria-selected', 'false');
    });

    it('handles no active page gracefully', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('handles invalid active page gracefully', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="nonexistent" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-selected', 'false');
      });
    });
  });

  describe('Event Handling Edge Cases', () => {
    it('handles multiple rapid clicks without issues', async () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      renderWithTheme(<Sidebar {...defaultProps} />);

      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });

      // Rapid clicks
      fireEvent.click(dashboardButton);
      fireEvent.click(dashboardButton);
      fireEvent.click(dashboardButton);

      await waitFor(() => {
        expect(mockDispatchEvent).toHaveBeenCalledTimes(3);
      });
    });

    it('maintains functionality when onClose is not provided', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      renderWithTheme(<Sidebar open={true} activePage="dashboard" />);

      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });

      expect(() => fireEvent.click(dashboardButton)).not.toThrow();
      expect(mockDispatchEvent).toHaveBeenCalled();
    });
  });
>>>>>>> origin/component/Header
});
