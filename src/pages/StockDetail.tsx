/**
 * StockDetail
 * -----------------------------------------------------------------------------
 * Fetches a single stock summary from /stocks/{ticker} and its historical
 * daily prices from /stock_prices/{ticker}.daily using the hooks:
 *  - useStockSummaryDoc(symbol)
 *  - usePriceHistory(symbol)
 *
 * One read for the summary, one read for all daily prices.
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
import {
  useStockSummaryDoc,
  usePriceHistory,
  useArimaxPredictions,
  useDLPredictions,
} from '../hooks/useStockData';
import useUserSettings from '../hooks/useUserSettings';
import KeyStatistics from '../components/stocks/KeyStatistics';
import StockChart from '../components/charts/StockChart';
import PredictionCard from '../components/stocks/PredictionCard';
import type { Range, Point } from '../components/charts/StockChart';
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

  // Load user preferences and AI predictions
  const { preferences, loading: prefsLoading } = useUserSettings();
  const { data: arimaxData } = useArimaxPredictions();
  const { data: dlData } = useDLPredictions();

  // Dynamically select predictions based on user's preferred model
  const activePredictions = React.useMemo(() => {
    if (prefsLoading) return null;
    return preferences.preferredModel === 'dl' ? dlData : arimaxData;
  }, [preferences.preferredModel, arimaxData, dlData, prefsLoading]);

  // New: chart range state
  const [range, setRange] = React.useState<Range>('3M');

  // Format timestamp properly - must be before any conditional returns
  const formattedTimestamp = React.useMemo(() => {
    if (!summary) return 'N/A';
    const updated =
      typeof summary.updatedAt === 'number'
        ? new Date(summary.updatedAt)
        : typeof summary.updatedAt === 'string'
          ? new Date(summary.updatedAt)
          : summary.updatedAt;

    if (updated instanceof Date && !isNaN(updated.getTime())) {
      return updated.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    return 'N/A';
  }, [summary]);

  /**
   * Normalize raw history rows to {date, price} and sort ascending.
   * - date: prefers row.date (YYYY-MM-DD), otherwise uses row.ts Timestamp.
   * - price: close -> price -> open -> 0
   */
  const allPoints = React.useMemo<Point[]>(() => {
    const rows = Array.isArray(history) ? history : [];
    const out: Point[] = rows
      .map((row: any) => {
        // prefer normalized row.date; fallback to row.id (if provided)
        const date: string | undefined =
          typeof row?.date === 'string'
            ? row.date
            : typeof row?.id === 'string'
              ? row.id
              : undefined;

        const price = Number(
          row?.close ?? row?.c ?? row?.price ?? row?.open ?? row?.o ?? 0
        );
        return date ? { date, price } : null;
      })
      .filter((p): p is Point => !!p);
    out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return out;
  }, [history]);

  /**
   * Filter normalized points according to the selected range.
   */
  const rangePoints = React.useMemo<Point[]>(() => {
    if (!allPoints.length) return [];
    const now = new Date();
    const days =
      range === '1W'
        ? 7
        : range === '1M'
          ? 30
          : range === '3M'
            ? 90
            : range === '1Y'
              ? 365
              : 365 * 5;

    const cutoff = new Date(now);
    cutoff.setUTCDate(now.getUTCDate() - days);

    // Keep points whose date >= cutoff; if not enough data, return all.
    const filtered = allPoints.filter(
      (p) => new Date(p.date + 'T00:00:00Z') >= cutoff
    );
    return filtered.length ? filtered : allPoints;
  }, [allPoints, range]);

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
      value: formattedTimestamp,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: { xs: 'stretch', md: 'flex-start' },
            }}
          >
            {/* Left side: Title and Price Info */}
            <Box sx={{ flex: { xs: '1', md: '0 0 60%' } }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{ fontWeight: 700 }}
                >
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

              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}
              >
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ fontWeight: 700 }}
                >
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

            {/* Right side: AI Prediction Card */}
            {activePredictions?.predicted?.[symbol] && (
              <Box sx={{ flex: { xs: '1', md: '0 0 35%' } }}>
                <PredictionCard
                  trend={
                    activePredictions.predicted[symbol].direction === 'up'
                      ? 'Bullish'
                      : 'Bearish'
                  }
                  confidence={Math.round(
                    activePredictions.predicted[symbol].probability * 100
                  )}
                />
              </Box>
            )}
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

        {/* Price chart */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          {errorHistory ? (
            <Alert severity="error">{errorHistory.message}</Alert>
          ) : loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <StockChart
              ticker={symbol}
              data={rangePoints}
              range={range}
              onRangeChange={setRange}
            />
          )}
        </Paper>
      </Box>
    </Box>
  );
}
