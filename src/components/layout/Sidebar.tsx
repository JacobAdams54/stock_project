/**
 * Sidebar navigation component for dashboard pages.
 * Uses Material UI's Drawer for responsive, accessible navigation.
 * Implements permanent drawer on desktop (≥600px) and temporary drawer on mobile.
 *
 * @component
 * @param {Props} props - Component props
 * @param {boolean} props.open - Whether the sidebar drawer is open (controls mobile temporary drawer)
 * @param {() => void} props.onClose - Callback to close the drawer (called after navigation on mobile)
 * @param {string} props.activePage - The current active page identifier (dashboard, predictions, watchlist, settings)
 * @param {() => Window} [props.window] - Optional window object for testing purposes
 * @returns {JSX.Element} Rendered sidebar navigation component with responsive Material UI Drawer
 *
 * @example
 * // Basic usage with controlled open state
 * const [open, setOpen] = useState(false);
 * <Sidebar
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   activePage="dashboard"
 * />
 *
 * @example
 * // Listen for navigation events
 * useEffect(() => {
 *   const handleNavigate = (e: CustomEvent) => {
 *     console.log('Navigating to:', e.detail.page);
 *   };
 *   window.addEventListener('navigate', handleNavigate);
 *   return () => window.removeEventListener('navigate', handleNavigate);
 * }, []);
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MovingIcon from '@mui/icons-material/Moving';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * Width of the sidebar drawer in pixels
 * @constant {number}
 */
const drawerWidth = 240;

/**
 * Props interface for Sidebar component
 * @interface Props
 * @property {boolean} open - Controls visibility of temporary drawer (mobile)
 * @property {() => void} onClose - Handler called when drawer should close
 * @property {string} activePage - Currently active page for highlighting
 * @property {() => Window} [window] - Optional window object override for testing
 */
interface Props {
  open: boolean;
  onClose: () => void;
  activePage: string;
  window?: () => Window;
}

/**
 * Menu item definition interface
 * @interface MenuItem
 * @property {React.ElementType} icon - Material UI icon component
 * @property {string} label - Display label for menu item
 * @property {string} page - Page identifier for navigation
 */
interface MenuItem {
  icon: React.ElementType;
  label: string;
  page: string;
}

export default function Sidebar(props: Props) {
  const { window: propWindow, open, onClose, activePage } = props;

  const container =
    propWindow !== undefined ? () => propWindow().document.body : undefined;

  /**
   * Navigation menu configuration
   * @constant {MenuItem[]}
   */
  const menuItems: MenuItem[] = [
    { icon: DashboardIcon, label: 'Dashboard', page: 'dashboard' },
    { icon: MovingIcon, label: 'Predictions', page: 'predictions' },
    { icon: BookmarksIcon, label: 'Watchlist', page: 'watchlist' },
    { icon: SettingsIcon, label: 'Settings', page: 'settings' },
  ];

  /**
   * Handles navigation to a new page by dispatching a custom event
   * and closing the mobile drawer.
   *
   * @param {string} page - Page identifier to navigate to
   * @fires CustomEvent#navigate - Dispatched with { detail: { page } }
   */
  const handleNavigation = (page: string) => {
    const event = new CustomEvent('navigate', { detail: { page } });
    const target = propWindow ? propWindow() : window;
    target.dispatchEvent(event);
    // Close drawer on mobile (parent controls open; call onClose to request close)
    onClose();
  };

  /**
   * Shared drawer content for both permanent and temporary variants
   * @constant {JSX.Element}
   */
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const selected = activePage === item.page;
          return (
            <ListItem key={item.page} disablePadding>
              <ListItemButton
                selected={selected}
                onClick={() => handleNavigation(item.page)}
                aria-current={selected ? 'page' : undefined}
                sx={{
                  ...(selected && {
                    backgroundColor: 'rgba(0,128,128,0.06)',
                    borderLeft: '4px solid',
                    borderColor: 'teal',
                    '& .MuiListItemIcon-root': { color: 'teal' },
                  }),
                }}
              >
                <ListItemIcon>
                  <Icon aria-hidden />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="dashboard navigation"
      >
        {/* Temporary drawer for mobile (< 600px) */}
        <Drawer
          container={container}
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }} // better performance on mobile
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent drawer for desktop (≥ 600px) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
