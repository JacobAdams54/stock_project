/**
 * Renders the global footer for the website.
 *
 * Includes:
 * - Company logo and description
 * - Social media icon buttons (Twitter, LinkedIn, GitHub)
 * - Navigation links (Quick Links using React Router)
 * - Static support links
 * - Legal and branding information in the bottom row
 *
 * Layout:
 * - Responsive 3-column grid using Tailwind CSS
 * - Uses Material UI for icons and button components
 *
 * @returns {JSX.Element} The rendered footer component
 */

import { IconButton } from '@mui/material';
import { Twitter, LinkedIn, GitHub } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white">
      <div className="w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            {/*<Logo size="md" variant="dark" />{/* This section renders the company logo and tagline at the top left of the footer */}
            {/* Render a placeholder logo image for now */}
            <img
              src="https://via.placeholder.com/150"
              alt="Placeholder logo"
              className="w-24 h-auto"
            />

            <p>
              Empowering investors with AI-driven insights and predictions for
              smarter trading decisions in the stock market.
            </p>

            <h3 className="text-white font-semibold text-lg">Follow Us</h3>
            <div>
              {' '}
              {/* This section creates the social media icons on the lower left of the footer */}
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
            {' '}
            {/* This section creates the Quick Links in the middle column of the footer */}
            <h3 className="text-white font-semibold text-lg">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/home"
                className="text-white hover:underline hover:text-gray-400 inline w-max"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="text-white hover:underline hover:text-gray-400 inline w-max"
              >
                Dashboard
              </Link>
              <Link
                to="/stocks"
                className="text-white hover:underline hover:text-gray-400 inline w-max"
              >
                Stocks
              </Link>
              <Link
                to="/about"
                className="text-white hover:underline hover:text-gray-400 inline w-max"
              >
                About
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {/* This section creates the Support links in the right column of the footer */}
            <h3 className="text-white font-semibold text-lg">Support</h3>
            <ul>
              <li>
                <a href="#" className="hover:underline hover:text-gray-400">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-gray-400">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-gray-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-gray-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* This section creates the bottom row of the footer with legal and branding information */}
      <div className="border-gray-700 pb-1.5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 px-2.5">
        <p>© 2025 STALK.AI. All rights reserved.</p>
        <p>Made with love for smart investors</p>
      </div>
    </footer>
  );
}
