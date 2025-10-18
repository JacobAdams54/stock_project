/**
 * Renders the global footer layout for the stock prediction website.
 * Includes logo, company description, navigation links, and legal text.
 * Uses grid layout and Material UI components.
 */

import React from 'react';
import { Logo } from './Logo';
import { IconButton } from '@mui/material';
import { Twitter, LinkedIn, GitHub } from '@mui/icons-material';
import { Link } from "react-router-dom";


export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white">
      <div className="w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="space-y-4">

            <Logo size="md" variant="dark" />
            <p>
              Empowering investors with AI-driven insights and predictions for
              smarter trading decisions in the stock market.
            </p>

            <h3 className='text-white font-semibold text-lg'>Follow Us</h3>
            <div>
              {/* This section creates the social media icons on the left of the footer */}
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
            <h3 className="text-white font-semibold text-lg">Quick Links</h3>
            <div className='flex flex-col space-y-2'>
              <Link to="/home" className="text-white hover:underline hover:text-gray-400 inline w-max">Home</Link>
              <Link to="/dashboard" className="text-white hover:underline hover:text-gray-400 inline w-max">Dashboard</Link>
              <Link to="/stocks" className="text-white hover:underline hover:text-gray-400 inline w-max">Stocks</Link>
              <Link to="/about" className="text-white hover:underline hover:text-gray-400 inline w-max">About</Link>
            </div>

          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Support</h3>
            <ul>
              <li>
                <a href="#" className="hover:underline hover:text-gray-400">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-gray-400">Contact Us</a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-gray-400">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:underline hover:text-gray-400">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-gray-700 pb-1.5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 px-2.5">
        <p>© 2025 STALK.AI. All rights reserved.</p>
        <p>Made with love for smart investors</p>
      </div>
    </footer>
  );
}
