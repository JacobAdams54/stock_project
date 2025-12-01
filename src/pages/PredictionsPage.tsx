/**
 * PredictionsPage component displaying AI predictions for watchlist stocks.
 * Shows ticker name and prediction card for each stock in the user's watchlist.
 * Visually similar to Dashboard with sidebar layout.
 * @returns {JSX.Element} Rendered PredictionsPage component
 */
import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import PredictionCard from '../components/stocks/PredictionCard';
import { useAuth } from '../components/layout/AuthContext';
import useUserSettings from '../hooks/useUserSettings';
import { useArimaxPredictions, useDLPredictions } from '../hooks/useStockData';

export default function PredictionsPage() {
  const { user } = useAuth();
  const {
    preferences,
    loading: prefsLoading,
    error: prefsError,
  } = useUserSettings();

  // Load AI predictions (both models)
  const { data: arimaxData, loading: arimaxLoading } = useArimaxPredictions();
  const { data: dlData, loading: dlLoading } = useDLPredictions();

  // Dynamically select predictions based on user's preferred model
  const activePredictions = useMemo(() => {
    if (prefsLoading) return null;
    return preferences.preferredModel === 'dl' ? dlData : arimaxData;
  }, [preferences.preferredModel, arimaxData, dlData, prefsLoading]);

  const predictionsLoading = useMemo(() => {
    return preferences.preferredModel === 'dl' ? dlLoading : arimaxLoading;
  }, [preferences.preferredModel, dlLoading, arimaxLoading]);

  // Local UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter predictions to only show watchlist items
  const watchlistPredictions = useMemo(() => {
    if (!activePredictions?.predicted || !preferences.watchlist) return [];

    return preferences.watchlist
      .map((ticker) => {
        const prediction = activePredictions.predicted[ticker];
        if (!prediction) return null;

        return {
          ticker,
          prediction,
        };
      })
      .filter((item) => item !== null) as Array<{
      ticker: string;
      prediction: any;
    }>;
  }, [activePredictions, preferences.watchlist]);

  // Guest protection
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          sx={{ display: 'flex', width: '100%', maxWidth: 'lg', gap: 3, p: 3 }}
        >
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="info">Please log in to view AI predictions.</Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  // Loading state
  if (prefsLoading || predictionsLoading) {
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
              Failed to load predictions: {prefsError.message}
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
            AI Predictions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            AI-powered predictions for your watchlist stocks using{' '}
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

          {/* Predictions Grid */}
          {preferences.watchlist.length === 0 ? (
            <Alert severity="info">
              Your watchlist is empty. Add stocks from the{' '}
              <Link to="/settings" style={{ color: 'inherit' }}>
                Settings
              </Link>{' '}
              page to see predictions.
            </Alert>
          ) : watchlistPredictions.length === 0 ? (
            <Alert severity="warning">
              No predictions available for your watchlist stocks at this time.
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing predictions for {watchlistPredictions.length} of{' '}
                {preferences.watchlist.length} stocks
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlistPredictions.map(({ ticker, prediction }) => (
                  <Paper
                    key={ticker}
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {ticker}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Next Day Prediction
                      </Typography>
                    </Box>
                    <PredictionCard
                      trend={
                        prediction.direction === 'up' ? 'Bullish' : 'Bearish'
                      }
                      confidence={Math.round(prediction.probability * 100)}
                    />
                  </Paper>
                ))}
              </div>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
