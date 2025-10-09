/*
 * Header.tsx
 * Header component with logo and navigation links
 * Responsive design with hamburger menu for mobile
*/

import React from "react";
import { Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
// import { Logo } from "./Logo"; // Uncomment and adjust path when Logo is available

export function Header() {
	// Navigation handler stub
	const handleNavigation = (page: string) => {
		const event = new CustomEvent("navigate", { detail: { page } });
		window.dispatchEvent(event);
	};

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div
						onClick={() => handleNavigation("home")}
						className="cursor-pointer"
						data-testid="logo"
					>
						{/* <Logo size="sm" variant="light" /> */}
						<span>Logo</span>
					</div>
					<nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
						<Button onClick={() => handleNavigation("home")}>Home</Button>
						<Button onClick={() => handleNavigation("dashboard")}>Dashboard</Button>
						<Button onClick={() => handleNavigation("stocks")}>Stocks</Button>
						<Button onClick={() => handleNavigation("about")}>About</Button>
						<Button onClick={() => handleNavigation("login")}>Login</Button>
						<Button size="small" onClick={() => handleNavigation("admin")} color="inherit">Admin</Button>
						<Button variant="contained" color="primary" size="small" onClick={() => handleNavigation("signup")}>
							Sign Up
						</Button>
					</nav>
					<div className="md:hidden">
						<IconButton size="small" aria-label="Open menu">
							<MenuIcon />
						</IconButton>
					</div>
				</div>
			</div>
		</header>
	);
}
