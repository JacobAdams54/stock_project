import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { useStockData } from '../hooks/useStockData';

/**
 * Stock detail page component
 *
 * @description
 * Main page for displaying comprehensive stock information. Follows "Smart Page, Dumb Components"
 * pattern where the page fetches all data and passes it down to presentational components.
 * This prevents duplicate API calls and coordinates loading/error states.
 *
 * @todo KeyStatistics component - implement with real API data
 * @todo StockChart component - being implemented by chart team
 * @todo AIPredictionCard component - being implemented by AI team
 *
 * @returns {JSX.Element} Stock detail page with header and placeholders for future components
 *
 * @example
 * // Accessed via route: /stock/:symbol
 * // URL: /stock/MSFT shows Microsoft stock header with placeholders
 */
const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const stockSymbol = symbol || 'MSFT';

  // 🎯 ARCHITECTURAL DECISION: Fetch ALL data here at page level
  // This prevents child components from making duplicate API calls
  const { data, loading, error } = useStockData(stockSymbol);

  // 🎨 LOADING STATE - Single loading state for entire page
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // 🛡️ ERROR STATE - Graceful error handling
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Failed to load stock data</Typography>
          <Typography variant="body2">{error.message}</Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Symbol: {symbol}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // ⚠️ NO DATA STATE
  if (!data) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          No data found for symbol: <strong>{symbol}</strong>
        </Alert>
      </Box>
    );
  }

  // ✅ SUCCESS STATE - Pass data down to "dumb" components
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Stock Header Section - Full width, clean design */}
      <Paper elevation={0} sx={{ p: 3, mb: 0, borderRadius: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Symbol and Company Name */}
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            {data.symbol}
          </Typography>

          <Typography variant="body1" color="text.secondary" gutterBottom>
            {data.name}
          </Typography>

          {/* Price and Change Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
              ${data.currentPrice.toFixed(2)}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: data.change >= 0 ? 'success.main' : 'error.main',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {data.change >= 0 ? '▲' : '▼'}$
                {Math.abs(data.change).toFixed(2)} (
                {data.changePercent >= 0 ? '+' : ''}
                {data.changePercent.toFixed(2)}%)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Key Statistics Section - Placeholder */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, pt: 3, pb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'grey.300',
            backgroundColor: 'grey.50',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📊 Key Statistics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Statistics component being implemented - will display company info,
            sector, market cap, and 52-week ranges
          </Typography>
        </Paper>
      </Box>

      {/* Main Content Container - Future home of chart and AI predictions */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3, pt: 2 }}>
        {/* 
          🎯 TEAM NOTE: Chart and AI components will be implemented by other teams
          - StockChart component (chart team)
          - AIPredictionCard component (AI team)
          Once ready, they'll be integrated in the grid layout below
        */}

        {/* Placeholder: Chart and AI Prediction sections coming soon */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
            gap: 3,
          }}
        >
          {/* Chart Section Placeholder */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'grey.300',
              backgroundColor: 'grey.50',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              📊 Stock Chart
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chart component being implemented by chart team
            </Typography>
          </Paper>

          {/* AI Prediction Card Placeholder */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'grey.300',
              backgroundColor: 'grey.50',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              🤖 AI Prediction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI component being implemented by AI team
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default StockDetail;
