/**
 * StockListingPage
 *
 * Fetches all available stocks using useAllStockSummaries (from /stocks/{ticker})
 * and renders them in a searchable, filterable grid of StockCard components.
 *
 * Reads behavior:
 * - useAllStockSummaries performs one document read per ticker in TICKERS.
 *   This is the minimum necessary with per-ticker docs in Firestore.
 *
 * Notes
 * - This page is presentation-focused; Firestore logic lives in useStockData.
 * - Searching matches ticker symbol or companyName.
 * - Sector filter values are derived from fetched data.
 */

import React from 'react';
import { Box, Container, Typography, TextField, Select } from '@mui/material';
import { Link } from 'react-router-dom';

import StockCard from '../components/stocks/StockCard';
import { useAllStockSummaries } from '../hooks/useStockData';

export default function StockListingPage() {
  // Load all stock summaries from /stocks/{ticker}
  const { data, loading, error } = useAllStockSummaries();

  // Local UI state
  const [query, setQuery] = React.useState('');
  const [sector, setSector] = React.useState('All');
  const [sort, setSort] = React.useState('');

  // Use fetched data or an empty array until loaded
  const stocks = React.useMemo(() => data ?? [], [data]);

  // Sector options derived from fetched data
  const sectors = React.useMemo(() => {
    const s = Array.from(new Set(stocks.map((x) => x.sector).filter(Boolean)));
    return ['All', ...s];
  }, [stocks]);

  // Apply search and filter
  const filtered = React.useMemo(() => {
    const out = stocks.filter((s) => {
      const matchesQuery =
        query.trim() === '' ||
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.companyName.toLowerCase().includes(query.toLowerCase());
      const matchesSector = sector === 'All' || s.sector === sector;
      return matchesQuery && matchesSector;
    });
    const sorted = [...out];
    if (sort === 'price-asc') {
      sorted.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sort === 'symbol-asc') {
      sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    return sorted;
  }, [stocks, query, sector, sort]);

  return (
    <div>
      <Container maxWidth="lg" className="py-6">
        <Typography variant="h4" component="h1" gutterBottom>
          Stock Predictions
        </Typography>
        <Typography variant="body1" className="mb-4">
          AI-powered predictions for tracked stocks. Filter, sort, and search to
          find stocks of interest.
        </Typography>

        {/* Filters */}
        <Box className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-6">
          <TextField
            placeholder="Search by symbol or company"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            slotProps={{ input: { 'aria-label': 'search stocks' } }}
            sx={{ minWidth: 240 }}
          />

          <Select
            native
            value={sector}
            onChange={(e) => setSector(String(e.target.value))}
            size="small"
            displayEmpty
            inputProps={{ 'aria-label': 'sector' }}
            sx={{ minWidth: 160 }}
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>

          <Select
            native
            value={sort}
            onChange={(e) => setSort(String(e.target.value))}
            size="small"
            displayEmpty
            inputProps={{ 'aria-label': 'sort' }}
            sx={{ minWidth: 200 }}
          >
            <option value="">None</option>
            <option value="price-asc">Price (low → high)</option>
            <option value="symbol-asc">Symbol (A → Z)</option>
          </Select>
        </Box>

        {/* Status */}
        {loading && <Typography>Loading stocks…</Typography>}
        {error && !loading && (
          <Typography color="error">Failed to load stocks.</Typography>
        )}

        {/* Grid */}
        {!loading &&
          !error &&
          (filtered.length === 0 ? (
            <Typography>No stocks found matching your criteria.</Typography>
          ) : (
            <div data-testid="stock-grid" className="overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filtered.map((s) => (
                  <Link
                    key={s.symbol}
                    to={`/stocks/${s.symbol}`}
                    data-testid={`stock-card-${s.symbol}`}
                    className="block cursor-pointer"
                  >
                    <StockCard
                      address1={s.address1}
                      change24hPercent={s.change24hPercent}
                      city={s.city}
                      companyName={s.companyName}
                      country={s.country}
                      currentPrice={s.currentPrice}
                      dividendYield={s.dividendYield}
                      dividendYieldPercent={s.dividendYieldPercent}
                      fiftyTwoWeekHigh={s.fiftyTwoWeekHigh}
                      fiftyTwoWeekLow={s.fiftyTwoWeekLow}
                      industry={s.industry}
                      marketCap={s.marketCap}
                      open={s.open}
                      peRatio={s.peRatio}
                      sector={s.sector}
                      state={s.state}
                      updatedAt={s.updatedAt}
                      volume={s.volume}
                      website={s.website}
                      zip={s.zip}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </Container>
    </div>
  );
}
