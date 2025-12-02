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
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  Alert,
  Button,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import StockCard from '../components/stocks/StockCard';
import {
  useAllStockSummaries,
  useArimaxPredictions,
  useDLPredictions,
  filterStocksByVisibility,
} from '../hooks/useStockData';
import useUserSettings from '../hooks/useUserSettings';
import { useAuth } from '../components/layout/AuthContext';

export default function StockListingPage() {
  // Get user auth state to check if admin
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Load all stock summaries from /stocks/{ticker}
  const { data, loading, error } = useAllStockSummaries();

  // Load user preferences to determine which AI model to use
  const { preferences, loading: prefsLoading } = useUserSettings();

  // Load AI predictions (both models)
  const { data: arimaxData } = useArimaxPredictions();
  const { data: dlData } = useDLPredictions();

  // Dynamically select predictions based on user's preferred model
  const activePredictions = React.useMemo(() => {
    if (prefsLoading) return null;
    return preferences.preferredModel === 'dl' ? dlData : arimaxData;
  }, [preferences.preferredModel, arimaxData, dlData, prefsLoading]);

  // Local UI state
  const [query, setQuery] = React.useState('');
  const [sector, setSector] = React.useState('All');
  const [sort, setSort] = React.useState('');

  // Use fetched data or an empty array until loaded
  // Filter stocks based on visibility (admins see all, users see only visible)
  const stocks = React.useMemo(() => {
    const allStocks = data ?? [];
    return filterStocksByVisibility(allStocks, isAdmin ?? false);
  }, [data, isAdmin]);

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

        {/* Guest user message */}
        {!user ? (
          <Alert
            severity="info"
            sx={{ mb: 4 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
            }
          >
            Please log in to view stock predictions and access AI-powered
            insights.
          </Alert>
        ) : (
          <>
            <Typography variant="body1" className="mb-4">
              AI-powered predictions for tracked stocks using{' '}
              {!prefsLoading && preferences.preferredModel === 'dl'
                ? 'Deep Learning'
                : 'ARIMAX'}{' '}
              model. Filter, sort, and search to find stocks of interest.
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
                    {filtered.map((s) => {
                      const prediction =
                        activePredictions?.predicted?.[s.symbol];
                      // Normalize updatedAt so it's a Date | string | number (handle Firestore Timestamp)
                      const updatedAtValue =
                        s.updatedAt &&
                        typeof s.updatedAt === 'object' &&
                        'toDate' in s.updatedAt
                          ? (s.updatedAt as any).toDate()
                          : typeof s.updatedAt === 'number'
                            ? new Date(s.updatedAt)
                            : typeof s.updatedAt === 'string'
                              ? new Date(s.updatedAt)
                              : (s.updatedAt as any);

                      return (
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
                            updatedAt={updatedAtValue}
                            volume={s.volume}
                            website={s.website}
                            zip={s.zip}
                            aiPrediction={prediction}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
          </>
        )}
      </Container>
    </div>
  );
}
