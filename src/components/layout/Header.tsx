/*
 * Header.tsx
 * Header component with logo and navigation links
 * Responsive design with hamburger menu for mobile
*/

import React from "react";
import logo from "../../assets/logo.png"; // Adjust path as necessary
import { AppBar, Toolbar, Button, IconButton, Drawer, TextField, InputAdornment, Avatar, Menu, MenuItem, Badge, Stack } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
// import { Logo } from "./Logo"; // Uncomment and adjust path when Logo is available

export default function Header() {
	// Navigation handler stub
	const handleNavigation = (page: string) => {
		const event = new CustomEvent("navigate", { detail: { page } });
		window.dispatchEvent(event);
	};

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const openUserMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
	const closeUserMenu = () => setAnchorEl(null);

	return (
		<header className="w-full sticky top-0 z-50" role="banner">
			<AppBar position="static" color="default" elevation={0}>
				<Toolbar className="mx-auto px-4 sm:px-6 lg:px-8">
					<div
						onClick={() => handleNavigation("home")}
						className="cursor-pointer"
						data-testid="logo"
					>
						{/* <Logo size="sm" variant="light" /> */}
						<img
							src={ logo }
							alt="Logo"
							width={40}
							height={40}
							className="object-contain"
							loading="eager"
						/>
					</div>

					{/* Search */}
					<div className="flex-1 mx-4 hidden md:block">
						<TextField
							size="small"
							placeholder="Search stocks, tickers..."
							variant="outlined"
							fullWidth
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
					</div>

					<nav className="hidden md:flex items-center" aria-label="Main navigation">
						<Stack direction="row" spacing={6} alignItems="center">
							<Button onClick={() => handleNavigation("home")}>Home</Button>
							<Button onClick={() => handleNavigation("stocks")}>Stocks</Button>
							<Button onClick={() => handleNavigation("about")}>About</Button>
							<Button onClick={() => handleNavigation("login")}>Login</Button>
							<Button variant="contained" color="primary" size="small" onClick={() => handleNavigation("signup")}>
								Sign Up
							</Button>
							<IconButton onClick={openUserMenu} size="small" aria-label="account">
								<Badge color="secondary" variant="dot">
									<Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
								</Badge>
							</IconButton>
						</Stack>
						<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeUserMenu}>
							<MenuItem onClick={() => { closeUserMenu(); handleNavigation("profile"); }}>Profile</MenuItem>
							<MenuItem onClick={() => { closeUserMenu(); handleNavigation("logout"); }}>Logout</MenuItem>
						</Menu>
					</nav>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<IconButton onClick={() => setDrawerOpen(true)} aria-label="Open menu">
							<MenuIcon />
						</IconButton>
					</div>
				</Toolbar>
			</AppBar>

			{/* Mobile drawer */}
			<Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
				<div className="w-64 p-4">
					<Button fullWidth onClick={() => { setDrawerOpen(false); handleNavigation("home"); }}>Home</Button>
					<Button fullWidth onClick={() => { setDrawerOpen(false); handleNavigation("stocks"); }}>Stocks</Button>
					<Button fullWidth onClick={() => { setDrawerOpen(false); handleNavigation("about"); }}>About</Button>
				</div>
			</Drawer>
		</header>
	);
}
