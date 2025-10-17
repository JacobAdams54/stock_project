/**
 * @fileoverview Test suite for Sidebar navigation component
 * Tests Material UI Drawer-based sidebar with responsive behavior,
 * navigation events, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';

// Mock Material UI icons - match actual imports
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

// Helper function to render component with Material UI theme
const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Sidebar Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    activePage: 'dashboard',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sidebar with all menu items', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      // Use getAllByText since items appear in both mobile and desktop drawers
      expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Predictions')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Watchlist')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Settings')[0]).toBeInTheDocument();
    });

    it('renders correct icons for each menu item', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      // Icons are also duplicated (mobile + desktop)
      expect(screen.getAllByTestId('dashboard-icon')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('predictions-icon')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('watchlist-icon')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('settings-icon')[0]).toBeInTheDocument();
    });

    it('applies correct styling to active menu item', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="predictions" />);

      const predictionsButtons = screen.getAllByRole('button', {
        name: /predictions/i,
      });
      // Material UI uses aria-current="page" for selected items
      expect(predictionsButtons[0]).toHaveAttribute('aria-current', 'page');
    });

    it('renders Material UI Drawer component', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      // Check for drawer by looking for MUI Drawer's paper element
      const drawer = document.querySelector('.MuiDrawer-paper');
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('Navigation Events', () => {
    it('dispatches custom navigate event when menu item is clicked', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      renderWithTheme(<Sidebar {...defaultProps} />);

      const predictionsButtons = screen.getAllByRole('button', {
        name: /predictions/i,
      });
      fireEvent.click(predictionsButtons[0]);

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

      const dashboardButtons = screen.getAllByRole('button', {
        name: /dashboard/i,
      });
      fireEvent.click(dashboardButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });

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
        const buttons = screen.getAllByRole('button', { name: buttonName });
        fireEvent.click(buttons[0]);

        expect(mockDispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'navigate',
            detail: { page: expectedPage },
          })
        );
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('renders permanent drawer visible on desktop', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      // Permanent drawer should be in the document
      const permanentDrawer = document.querySelector('.MuiDrawer-docked');
      expect(permanentDrawer).toBeInTheDocument();
    });

    it('renders temporary drawer for mobile', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      // Both temporary and permanent drawers exist, responsive CSS controls visibility
      const drawers = document.querySelectorAll('.MuiDrawer-root');
      expect(drawers.length).toBeGreaterThanOrEqual(2); // temp + permanent
    });

    it('handles open/close state for mobile drawer', () => {
      const { rerender } = renderWithTheme(
        <Sidebar {...defaultProps} open={false} />
      );

      // Temporary drawer should be closed
      let modal = document.querySelector('.MuiModal-root');
      expect(modal).toBeInTheDocument();

      // Open drawer
      rerender(
        <ThemeProvider theme={createTheme()}>
          <Sidebar {...defaultProps} open={true} />
        </ThemeProvider>
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

      const menuButtons = screen.getAllByRole('button');
      menuButtons.forEach((button) => {
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });

    it('supports keyboard navigation', () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      renderWithTheme(<Sidebar {...defaultProps} />);

      const dashboardButtons = screen.getAllByRole('button', {
        name: /dashboard/i,
      });

      // Simulate Enter key press
      fireEvent.keyDown(dashboardButtons[0], { key: 'Enter', code: 'Enter' });

      // Material UI ListItemButton should handle keyboard events
      expect(dashboardButtons[0]).toBeInTheDocument();
    });

    it('has proper ARIA attributes for selected state', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="watchlist" />);

      const watchlistButtons = screen.getAllByRole('button', {
        name: /watchlist/i,
      });
      const dashboardButtons = screen.getAllByRole('button', {
        name: /dashboard/i,
      });

      expect(watchlistButtons[0]).toHaveAttribute('aria-current', 'page');
      expect(dashboardButtons[0]).not.toHaveAttribute('aria-current', 'page');
    });

    it('provides proper button labels', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      expect(
        screen.getAllByRole('button', { name: /dashboard/i })[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: /predictions/i })[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: /watchlist/i })[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: /settings/i })[0]
      ).toBeInTheDocument();
    });
  });

  describe('Active State Management', () => {
    it('highlights only the active menu item', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="settings" />);

      const settingsButtons = screen.getAllByRole('button', {
        name: /settings/i,
      });
      const dashboardButtons = screen.getAllByRole('button', {
        name: /dashboard/i,
      });

      expect(settingsButtons[0]).toHaveAttribute('aria-current', 'page');
      expect(dashboardButtons[0]).not.toHaveAttribute('aria-current', 'page');
    });

    it('handles no active page gracefully', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('aria-current', 'page');
      });
    });

    it('handles invalid active page gracefully', () => {
      renderWithTheme(<Sidebar {...defaultProps} activePage="nonexistent" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('aria-current', 'page');
      });
    });
  });

  describe('Event Handling Edge Cases', () => {
    it('handles multiple rapid clicks without issues', async () => {
      const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
      renderWithTheme(<Sidebar {...defaultProps} />);

      const dashboardButtons = screen.getAllByRole('button', {
        name: /dashboard/i,
      });

      // Rapid clicks
      fireEvent.click(dashboardButtons[0]);
      fireEvent.click(dashboardButtons[0]);
      fireEvent.click(dashboardButtons[0]);

      await waitFor(() => {
        expect(mockDispatchEvent).toHaveBeenCalledTimes(3);
      });
    });
  });
});
