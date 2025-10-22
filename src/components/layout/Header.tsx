// src/components/Header.tsx
import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

type NavItem = { label: string; to: string; testId?: string };

const NAV_LINKS: NavItem[] = [
    { label: "Home", to: "/" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Stocks", to: "/stocks" },
    { label: "About", to: "/about" },
];

const AUTH_LINKS: NavItem[] = [
    { label: "Login", to: "/login" },
    { label: "Admin", to: "/admin" },
    { label: "Sign Up", to: "/signup" },
];

export default function Header() {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
    const { pathname } = useLocation();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const menuId = "primary-navigation-menu";

    const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);

    const isActive = (to: string) => {
        // Mark as active if the current path starts with the item's path
        // Adjust to exact match if preferred.
        return pathname === to || (to !== "/" && pathname.startsWith(to));
    };

    return (
        <header role="banner" data-testid="header">
            <AppBar
                component="div"
                position="sticky"
                color="transparent"
                elevation={0}
                sx={{
                    bgcolor: "background.paper",
                    borderBottom: 1,
                    borderColor: "divider",
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
                            sx={{ display: "flex", alignItems: "center", cursor: "pointer", textDecoration: "none" }}
                            aria-label="Go to Home"
                            role="link"
                        >
                            <img
                                src="https://via.placeholder.com/150"
                                alt="Placeholder logo"
                                className="w-24 h-auto"
                            />
                        </Box>

                        {/* spacer */}
                        <Box sx={{ flexGrow: 1 }} />

                        {/* Desktop nav */}
                        {isDesktop ? (
                            <Stack direction="row" spacing={2} alignItems="center" component="nav" aria-label="Main navigation">
                                {/* Primary nav */}
                                <Stack direction="row" spacing={1}>
                                    {NAV_LINKS.map(({ label, to }) => (
                                        <Button
                                            key={to}
                                            component={RouterLink}
                                            to={to}
                                            color="inherit"
                                            sx={{
                                                fontWeight: isActive(to) ? 600 : undefined,
                                                // Also set aria-current for screen readers
                                            }}
                                            aria-current={isActive(to) ? "page" : undefined}
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </Stack>

                                <Box sx={{ width: 8 }} />

                                {/* Auth/Admin */}
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Button
                                        component={RouterLink}
                                        to="/login"
                                        color="inherit"
                                        aria-current={isActive("/login") ? "page" : undefined}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        component={RouterLink}
                                        to="/admin"
                                        color="inherit"
                                        size="small"
                                        sx={{ textTransform: "none" }}
                                        aria-current={isActive("/admin") ? "page" : undefined}
                                    >
                                        Admin
                                    </Button>
                                    <Button
                                        component={RouterLink}
                                        to="/signup"
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            // Teal CTA — swap to theme.primary if you’ve themed it
                                            bgcolor: "#14b8a6",
                                            ":hover": { bgcolor: "#0d9488" },
                                            textTransform: "none",
                                        }}
                                        aria-current={isActive("/signup") ? "page" : undefined}
                                    >
                                        Sign Up
                                    </Button>
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
                                aria-expanded={open ? "true" : undefined}
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
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            {[...NAV_LINKS, ...AUTH_LINKS].map(({ label, to }) => (
                                <MenuItem
                                    key={to}
                                    component={RouterLink}
                                    to={to}
                                    onClick={closeMenu}
                                    selected={isActive(to)}
                                    aria-current={isActive(to) ? "page" : undefined}
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
