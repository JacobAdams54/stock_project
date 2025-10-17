/**
 * Sidebar navigation component for dashboard pages.
 * Uses Material UI's Drawer with React Router for navigation.
 * Implements permanent drawer on desktop (≥600px) and temporary drawer on mobile.
 *
 * @component
 * @param {Props} props - Component props
 * @param {boolean} props.open - Whether the sidebar drawer is open (controls mobile temporary drawer)
 * @param {() => void} props.onClose - Callback to close the drawer (called after navigation on mobile)
 * @returns {JSX.Element} Rendered sidebar navigation component with responsive Material UI Drawer
 */

import * as React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
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
 */
interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Menu item definition interface
 * @interface MenuItem
 * @property {React.ElementType} icon - Material UI icon component
 * @property {string} label - Display label for menu item
 * @property {string} path - Route path for navigation
 */
interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export default function Sidebar(props: Props) {
  const { open, onClose } = props;
  const location = useLocation();

  /**
   * Navigation menu configuration
   * @constant {MenuItem[]}
   */
  const menuItems: MenuItem[] = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { icon: MovingIcon, label: 'Predictions', path: '/predictions' },
    { icon: BookmarksIcon, label: 'Watchlist', path: '/watchlist' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

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
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={selected}
                onClick={onClose}
                aria-current={selected ? 'page' : undefined}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
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
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
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
