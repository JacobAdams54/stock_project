// src/components/stocks/StockCard.test.tsx
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockCard, { StockCardProps } from './StockCard';

afterEach(() => cleanup());

const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

function makeProps(overrides: Partial<StockCardProps> = {}): StockCardProps {
  return {
    address1: 'One Apple Park Way',
    change24hPercent: 3.19,
    city: 'Cupertino',
    companyName: 'Apple Inc.',
    country: 'United States',
    currentPrice: 167.89,
    dividendYield: 0.004,
    dividendYieldPercent: 0.4,
    fiftyTwoWeekHigh: 175.0,
    fiftyTwoWeekLow: 120.0,
    industry: 'Consumer Electronics',
    marketCap: 3989245001728,
    open: 165.0,
    peRatio: 30.5,
    sector: 'Technology',
    state: 'CA',
    updatedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    volume: 123456789,
    website: 'https://www.apple.com',
    zip: '95014',
    ...overrides,
  };
}

describe('StockCard', () => {
  test('renders company, sector badge, and location/industry', () => {
    render(<StockCard {...makeProps()} />);

    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument(); // sector chip
    expect(
      screen.getByText(/Consumer Electronics • Cupertino, CA • United States/i)
    ).toBeInTheDocument();
  });

  test('shows current price, predicted price placeholder, 24h change, and confidence', () => {
    const props = makeProps({
      change24hPercent: 3.19,
      currentPrice: 167.89,
    });
    render(<StockCard {...props} />);

    // Current Price
    expect(
      screen.getByText(fmtUSD.format(props.currentPrice))
    ).toBeInTheDocument();

    // Predicted Price placeholder: current * 1.017 when positive change
    const predicted = fmtUSD.format(props.currentPrice * 1.017);
    expect(screen.getByText(predicted)).toBeInTheDocument();

    // 24h Change
    expect(screen.getByText('+3.19%')).toBeInTheDocument();

    // Confidence placeholder
    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('91%')).toBeInTheDocument();

    // Recommendation chip (BUY when change is positive) and Low Risk chip
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  test('renders HOLD recommendation when 24h change is negative', () => {
    const props = makeProps({ change24hPercent: -1.71, currentPrice: 150 });
    render(<StockCard {...props} />);

    // Predicted price placeholder with down adjustment
    const predicted = fmtUSD.format(props.currentPrice * 0.983);
    expect(screen.getByText(predicted)).toBeInTheDocument();

    expect(screen.getByText('-1.71%')).toBeInTheDocument();
    expect(screen.getByText('HOLD')).toBeInTheDocument();
  });

  test('shows target as the 52-week high and analyzed time text', () => {
    const props = makeProps({ fiftyTwoWeekHigh: 390 });
    render(<StockCard {...props} />);

    expect(
      screen.getByText(`Target: ${fmtUSD.format(390)}`)
    ).toBeInTheDocument();
    // Avoid brittle exact time assertions; just ensure the footer text exists
    expect(screen.getByText(/Analyzed .* ago/i)).toBeInTheDocument();
  });
});
