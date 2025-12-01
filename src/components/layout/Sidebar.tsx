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
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MovingIcon from '@mui/icons-material/Moving';
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
    { icon: DashboardIcon, label: 'Dashboard', path: '/dashboard' },
    { icon: MovingIcon, label: 'Predictions', path: '/predictions' },
    { icon: SettingsIcon, label: 'Preferences', path: '/settings' },
  ];

  /**
   * Shared drawer content for both permanent and temporary variants
   * @constant {JSX.Element}
   */
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation section */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List sx={{ px: 1.5 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const selected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={selected}
                  onClick={onClose}
                  aria-current={selected ? 'page' : undefined}
                  sx={{
                    borderRadius: 1.5,
                    textDecoration: 'none',
                    color: 'text.secondary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 128, 128, 0.08)',
                      transform: 'translateX(4px)',
                    },
                    ...(selected && {
                      backgroundColor: 'rgba(0, 128, 128, 0.12)',
                      color: 'rgb(0, 128, 128)',
                      fontWeight: 600,
                      '& .MuiListItemIcon-root': {
                        color: 'rgb(0, 128, 128)',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 128, 128, 0.16)',
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: 'inherit',
                    }}
                  >
                    <Icon aria-hidden />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: selected ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      <CssBaseline />
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.default',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop static sidebar */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          bgcolor: 'background.default',
          borderRight: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
        aria-label="dashboard navigation"
      >
        {drawer}
      </Box>
    </>
  );
}

/**
 * Sidebar navigation component
 *
 * @note This component is ready for integration but not yet used in the application.
 * It will be integrated once the Dashboard layout component is created.
 *
 * @example
 * // Future usage in Dashboard component:
 * <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
 */
