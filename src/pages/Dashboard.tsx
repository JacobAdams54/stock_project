/**
 * Dashboard component displaying user's watchlist stocks.
 * Shows AI predictions and stock cards for stocks in the user's watchlist.
 * Visually similar to SettingsPanel with sidebar layout.
 * @returns {JSX.Element} Rendered Dashboard component
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  Select,
} from '@mui/material';
import Sidebar from '../components/layout/Sidebar';
import StockCard from '../components/stocks/StockCard';
import { useAuth } from '../components/layout/AuthContext';
import useUserSettings from '../hooks/useUserSettings';
import {
  useAllStockSummaries,
  useArimaxPredictions,
  useDLPredictions,
} from '../hooks/useStockData';

export default function Dashboard() {
  const { user } = useAuth();
  const {
    preferences,
    loading: prefsLoading,
    error: prefsError,
  } = useUserSettings();

  // Load all stock summaries
  const { data: allStocks, loading: stocksLoading } = useAllStockSummaries();

  // Load AI predictions (both models)
  const { data: arimaxData } = useArimaxPredictions();
  const { data: dlData } = useDLPredictions();

  // Dynamically select predictions based on user's preferred model
  const activePredictions = useMemo(() => {
    if (prefsLoading) return null;
    return preferences.preferredModel === 'dl' ? dlData : arimaxData;
  }, [preferences.preferredModel, arimaxData, dlData, prefsLoading]);

  // Local UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('');

  // Filter stocks to only show watchlist items
  const watchlistStocks = useMemo(() => {
    if (!allStocks || !preferences.watchlist) return [];
    return allStocks.filter((stock) =>
      preferences.watchlist.includes(stock.symbol)
    );
  }, [allStocks, preferences.watchlist]);

  // Apply search and sort
  const filteredStocks = useMemo(() => {
    const filtered = watchlistStocks.filter((s) => {
      const matchesQuery =
        query.trim() === '' ||
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.companyName.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });

    const sorted = [...filtered];
    if (sort === 'price-asc') {
      sorted.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sort === 'symbol-asc') {
      sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    return sorted;
  }, [watchlistStocks, query, sort]);

  // Guest protection
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          sx={{ display: 'flex', width: '100%', maxWidth: 'lg', gap: 3, p: 3 }}
        >
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="info">Please log in to view your dashboard.</Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  // Loading state
  if (prefsLoading || stocksLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          sx={{ display: 'flex', width: '100%', maxWidth: 'lg', gap: 3, p: 3 }}
        >
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  // Error state
  if (prefsError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          sx={{ display: 'flex', width: '100%', maxWidth: 'lg', gap: 3, p: 3 }}
        >
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">
              Failed to load dashboard: {prefsError.message}
            </Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box
        sx={{ display: 'flex', width: '100%', maxWidth: 'lg', gap: 3, p: 3 }}
      >
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h4" gutterBottom>
            My Watchlist
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            AI-powered predictions for your tracked stocks using{' '}
            {preferences.preferredModel === 'dl' ? 'Deep Learning' : 'ARIMAX'}{' '}
            model.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Want to add stocks or change your AI model?{' '}
            <Link
              to="/settings"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Go to Settings
            </Link>
          </Typography>

          {/* Search and Sort Controls */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                placeholder="Search by symbol or company"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="small"
                sx={{ flexGrow: 1 }}
                inputProps={{ 'aria-label': 'search watchlist stocks' }}
              />

              <Select
                native
                value={sort}
                onChange={(e) => setSort(String(e.target.value))}
                size="small"
                displayEmpty
                inputProps={{ 'aria-label': 'sort' }}
                sx={{ minWidth: 200 }}
              >
                <option value="">Sort by...</option>
                <option value="price-asc">Price (low → high)</option>
                <option value="symbol-asc">Symbol (A → Z)</option>
              </Select>
            </Box>
          </Paper>

          {/* Watchlist Stocks Grid */}
          {preferences.watchlist.length === 0 ? (
            <Alert severity="info">
              Your watchlist is empty. Add stocks from the{' '}
              <Link to="/settings" style={{ color: 'inherit' }}>
                Settings
              </Link>{' '}
              page.
            </Alert>
          ) : filteredStocks.length === 0 ? (
            <Alert severity="info">
              No stocks found matching your search criteria.
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {filteredStocks.length} of {watchlistStocks.length}{' '}
                stocks
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStocks.map((s) => {
                  const prediction = activePredictions?.predicted?.[s.symbol];
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
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
