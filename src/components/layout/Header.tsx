// src/components/Header.tsx
import * as React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Logo from '../layout/Logo';

/**
 * Navigation item used by the Header component.
 * @property {string} label - Visible label for the navigation link
 * @property {string} to - Route path the link navigates to
 * @property {string} [testId] - Optional test id for querying in tests
 */
type NavItem = { label: string; to: string; testId?: string };

const NAV_LINKS: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Stocks', to: '/stocks' },
  { label: 'About', to: '/about' },
];

const AUTH_LINKS: NavItem[] = [
  { label: 'Login', to: '/login' },
  { label: 'Admin', to: '/admin' },
  { label: 'Sign Up', to: '/signup' },
];

/**
 * Top-level site header with primary navigation and auth links.
 *
 * Renders a responsive AppBar with a logo that links to the home page, a
 * horizontal navigation on desktop and a hamburger + popup Menu on mobile.
 *
 * Accessibility:
 * - The root element is a landmark with role="banner" and data-testid="header"
 * - Navigation uses aria-label="Main navigation"
 * - Active links include aria-current="page"
 *
 * @returns {JSX.Element} The rendered header component
 */
export default function Header() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { pathname } = useLocation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = 'primary-navigation-menu';

  const openMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  /**
   * Returns true when the given route should be considered active based on the
   * current pathname. For the root path ("/"), only an exact match is active.
   * For other paths, any pathname that starts with `to` is considered active.
   *
   * @param {string} to - Route path to check
   * @returns {boolean} whether the route is active
   */
  const isActive = (to: string) => {
    // Mark as active if the current path starts with the item's path
    // Adjust to exact match if preferred.
    return pathname === to || (to !== '/' && pathname.startsWith(to));
  };

  return (
    <header role="banner" data-testid="header">
      <AppBar
        component="div"
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: (t) => t.zIndex.appBar,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 64, gap: 2 }}>
            {/* Logo (Home link) */}
            <Box
              data-testid="logo"
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
              aria-label="Go to Home"
              role="link"
            >
              <Logo />
            </Box>

            {/* spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop nav */}
            {isDesktop ? (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                component="nav"
                aria-label="Main navigation"
              >
                {/* Primary nav */}
                <Stack direction="row" spacing={1}>
                  {NAV_LINKS.map(({ label, to }) => (
                    <Button
                      key={to}
                      component={RouterLink}
                      to={to}
                      color={isActive(to) ? 'primary' : 'inherit'}
                      variant={isActive(to) ? 'contained' : 'text'}
                      size="small"
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>

                <Box sx={{ width: 8 }} />

                {/* Auth/Admin */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {AUTH_LINKS.map(({ label, to }) => (
                    <Button
                      key={to}
                      component={RouterLink}
                      to={to}
                      color={label === 'Sign Up' ? 'primary' : 'inherit'}
                      variant={label === 'Sign Up' ? 'contained' : 'text'}
                      size="small"
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            ) : (
              // Mobile: hamburger
              <IconButton
                size="small"
                edge="end"
                aria-label="Open navigation menu"
                aria-controls={open ? menuId : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={openMenu}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Mobile Menu (uses RouterLink in MenuItem) */}
            <Menu
              id={menuId}
              anchorEl={anchorEl}
              open={open}
              onClose={closeMenu}
              keepMounted
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {[...NAV_LINKS, ...AUTH_LINKS].map(({ label, to }) => (
                <MenuItem
                  key={to}
                  component={RouterLink}
                  to={to}
                  onClick={closeMenu}
                  selected={isActive(to)}
                  aria-current={isActive(to) ? 'page' : undefined}
                >
                  {label}
                </MenuItem>
              ))}
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
    </header>
  );
}
