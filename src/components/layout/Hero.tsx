//Hero.tsx
import React from 'react';
import { Button } from '@mui/material';
import { ImageWithFallback } from './ImageWithFallback';


export function Hero() {
  const handleGetStarted = () => {
    const event = new CustomEvent('navigate', { detail: { page: 'signup' } });
    window.dispatchEvent(event);
  };


  return (
    <section
      role="region"
      aria-labelledby="hero-heading"
      className="bg-gradient-to-br from-slate-50 to-teal-50 py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 id="hero-heading" className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Stock Predictions
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Make smarter investment decisions with real-time insights and explainable forecasts.
            </p>
            <Button onClick={handleGetStarted} aria-label="Get Started">
              Get Started
            </Button>
          </div>
          <div className="lg:w-1/2">
            <ImageWithFallback
              src="https://example.com/hero-chart.png"
              fallbackSrc="https://placehold.co/1080x720?text=Stock+Prediction+AI"
              alt="Stock market chart illustration"
              loading="lazy"
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
