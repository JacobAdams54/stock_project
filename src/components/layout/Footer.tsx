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

import { Link } from 'react-router-dom';
import Logo from './Logo';
import Container from '@mui/material/Container';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white">
      {/* Constrain to same width as Header (Container maxWidth="lg") */}
      <Container maxWidth="lg">
        <div className="w-full py-12">
          {/* Use a 12-col grid to push Quick Links and Support to the right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: brand spans half width on md+ */}
            <div className="space-y-4 md:col-span-6">
              {/* This section renders the company logo and tagline at the top left of the footer to a custom size of 100px*/}
              <Logo customSize="100px" />

              <p>
                Empowering investors with AI-driven insights and predictions for
                smarter trading decisions in the stock market.
              </p>
            </div>

            <div className="space-y-4 md:col-span-3">
              <h3 className="text-white font-semibold text-lg">Quick Links</h3>
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
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
          </div>
        </div>
      </Container>

      {/* Bottom row constrained to the same width */}
      <div className="border-gray-700">
        <Container maxWidth="lg">
          <div className="pb-1.5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 STALK.AI. All rights reserved.</p>
            <p>Made with love for smart investors</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
