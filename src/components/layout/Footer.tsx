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
  return <footer>
    <div className="grid">
      <div>

        <Logo size="sm" variant="dark" />
        <p>
          Empowering investors with AI-driven insights and predictions for smarter trading decisions in the stock market.
        </p>

        <div>
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

      <div>
        <h3>Quick Links</h3>
        <Link component="button" onClick={() => handleNavigation("home")}>Home</Link>
        <Link component="button" onClick={() => handleNavigation("dashboard")}>Dashboard</Link>
        <Link component="button" onClick={() => handleNavigation("stocks")}>Stocks</Link>
        <Link component="button" onClick={() => handleNavigation("about")}>About</Link>
      </div>

      <div> 
        <h3>Support</h3>
        <ul>
          <li><a href="#">Help Center</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
      </div>
      
    </div>
  </footer>;
}
