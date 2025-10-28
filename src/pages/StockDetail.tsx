/**
 * StockDetail
 * -----------------------------------------------------------------------------
 * Fetches a single stock summary from /stocks/{ticker} and its historical
 * daily prices from /prices/{ticker}/daily using the new hooks:
 *  - useStockSummaryDoc(symbol)
 *  - usePriceHistory(symbol)
 *
 * The page lists ALL available summary fields and shows a placeholder for the
 * future chart (history is fetched but not rendered as a chart yet).
 *
 * @returns {JSX.Element} Stock detail page for a single symbol
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Chip,
  Link as MUILink,
} from '@mui/material';
import { useStockSummaryDoc, usePriceHistory } from '../hooks/useStockData';
import KeyStatistics from '../components/stocks/KeyStatistics';
import StockChart from '../components/charts/StockChart';

/**
 * StockDetail
 * -----------------------------------------------------------------------------
 * Fetch a single stock summary and its daily history.
 * Lists all summary fields and shows a placeholder for the future chart.
 */
const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const fmtCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});
const fmtInt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export default function StockDetail(): React.ReactElement {
  const { symbol: routeSymbol } = useParams<{ symbol: string }>();
  const symbol = (routeSymbol ?? 'AAPL').toUpperCase();

  const {
    data: summary,
    loading: loadingSummary,
    error: errorSummary,
  } = useStockSummaryDoc(symbol);
  const {
    data: history,
    loading: loadingHistory,
    error: errorHistory,
  } = usePriceHistory(symbol);

  if (loadingSummary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (errorSummary) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Failed to load stock
          </Typography>
          <Typography variant="body2">{errorSummary.message}</Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            Symbol: {symbol}
          </Typography>
        </Alert>
      </Box>
    );
  }
  if (!summary) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">No data found for symbol: {symbol}</Alert>
      </Box>
    );
  }

  const isUp = summary.change24hPercent >= 0;
  const arrow = isUp ? '▲' : '▼';
  const updated =
    typeof summary.updatedAt === 'number'
      ? new Date(summary.updatedAt)
      : typeof summary.updatedAt === 'string'
        ? new Date(summary.updatedAt)
        : summary.updatedAt;

  const detailsLeft = [
    { label: 'Current Price', value: fmtUSD.format(summary.currentPrice) },
    { label: 'Open', value: fmtUSD.format(summary.open) },
    { label: '24h Change', value: fmtPct(summary.change24hPercent) },
    {
      label: 'P/E Ratio',
      value: summary.peRatio?.toFixed?.(2) ?? String(summary.peRatio),
    },
    {
      label: 'Dividend Yield %',
      value: `${summary.dividendYieldPercent.toFixed(1)}%`,
    },
    { label: 'Dividend Yield (raw)', value: summary.dividendYield.toFixed(4) },
    { label: '52 Week High', value: fmtUSD.format(summary.fiftyTwoWeekHigh) },
    { label: '52 Week Low', value: fmtUSD.format(summary.fiftyTwoWeekLow) },
    { label: 'Market Cap', value: fmtCompact.format(summary.marketCap) },
    { label: 'Volume', value: fmtInt.format(summary.volume) },
  ];

  const detailsRight = [
    { label: 'Industry', value: summary.industry },
    { label: 'Sector', value: summary.sector },
    { label: 'Company', value: summary.companyName },
    { label: 'Website', value: summary.website },
    {
      label: 'Address',
      value: `${summary.address1}, ${summary.city}, ${summary.state} ${summary.zip}, ${summary.country}`,
    },
    {
      label: 'Last Updated',
      value:
        updated instanceof Date ? updated.toLocaleString() : String(updated),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              {symbol}
            </Typography>
            <Chip
              label={summary.sector}
              size="small"
              sx={{ bgcolor: '#f3f4f6', border: '1px solid #e5e7eb' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            {summary.companyName}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
              {fmtUSD.format(summary.currentPrice)}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: isUp ? 'success.main' : 'error.main',
              }}
            >
              {arrow} {fmtPct(summary.change24hPercent)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Key Statistics summary row */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, mb: 2 }}>
        <KeyStatistics
          companyName={summary.companyName}
          sector={summary.sector}
          marketCap={summary.marketCap}
          fiftyTwoWeekHigh={summary.fiftyTwoWeekHigh}
          fiftyTwoWeekLow={summary.fiftyTwoWeekLow}
        />
      </Box>

      {/* Details grid (all summary fields) */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Company Summary
          </Typography>
          <Grid container spacing={2}>
            {detailsLeft.map((row) => (
              <Grid key={row.label}>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <Typography color="text.secondary">{row.label}</Typography>
                  <Typography fontWeight={600}>{row.value}</Typography>
                </Box>
              </Grid>
            ))}
            {detailsRight.map((row) => (
              <Grid key={row.label}>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <Typography color="text.secondary">{row.label}</Typography>
                  {row.label === 'Website' ? (
                    <MUILink
                      href={summary.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {summary.website}
                    </MUILink>
                  ) : (
                    <Typography fontWeight={600} textAlign="right">
                      {row.value}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Placeholder for chart/history */}
        <StockChart
          symbol={symbol}
          history={history}
          loading={loadingHistory}
          error={errorHistory}
        />
      </Box>
    </Box>
  );
}
