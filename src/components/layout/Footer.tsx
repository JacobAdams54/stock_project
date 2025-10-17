/**
 * Renders the global footer layout for the stock prediction website.
 * Includes logo, company description, navigation links, and legal text.
 * Uses grid layout and Material UI components.
 */



import React from "react";
import { Logo } from "./Logo";
import { IconButton } from "@mui/material";
import { Twitter, LinkedIn, GitHub } from "@mui/icons-material";
import { Link } from "@mui/material";


export default function Footer() {
  const handleNavigation = (page: string) => {
  const event = new CustomEvent("navigate", { detail: { page } });
  window.dispatchEvent(event);
};
  return <footer className="bg-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-4">
        <Logo size="sm" variant="dark" />
        <p>
          Empowering investors with AI-driven insights and predictions for smarter trading decisions in the stock market.
        </p>

        <div>{/* This section creates the social media icons on the left of the footer */}
          <IconButton aria-label="Twitter" color="inherit">
            <Twitter />
          </IconButton>
          <IconButton aria-label="LinkedIn" color="inherit">
            <LinkedIn />
          </IconButton>
          <IconButton aria-label="GitHub" color="inherit">
            <GitHub />
          </IconButton>
        </div>
      </div>

      <div className="space-y-4">
        <h3>Quick Links</h3>
        <Link component="button" onClick={() => handleNavigation("home")}>Home</Link>
        <Link component="button" onClick={() => handleNavigation("dashboard")}>Dashboard</Link>
        <Link component="button" onClick={() => handleNavigation("stocks")}>Stocks</Link>
        <Link component="button" onClick={() => handleNavigation("about")}>About</Link>
      </div>

      <div className="space-y-4"> 
        <h3>Support</h3>
        <ul>
          <li><a href="#">Help Center</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
      </div>
      
      </div>
    </div>
    

    <div>
      <p>© 2025 STALK.AI. All rights reserved.</p>
      <p>Made with love for smart investors</p>
    </div>
  </footer>;
}
