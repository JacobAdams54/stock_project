/**
 * @file StockCard.tsx
 * @description Light stock summary card using only the allowed data fields.
 * Predicted price and confidence are placeholders until AI is integrated.
 */

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Divider,
} from '@mui/material';

/**
 * Strongly typed props for the StockCard component.
 * Only the fields listed by the project are allowed.
 */
export type StockCardProps = {
  address1: string;
  change24hPercent: number;
  city: string;
  companyName: string;
  country: string;
  currentPrice: number;
  dividendYield: number;
  dividendYieldPercent: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  industry: string;
  marketCap: number;
  open: number;
  peRatio: number;
  sector: string;
  state: string;
  updatedAt: string | number | Date;
  volume: number;
  website: string;
  zip: string;
};

/**
 * A presentational stock card that renders company info, price,
 * 24h change, placeholder prediction and confidence, and quick tags.
 *
 * - Predicted Price: placeholder derived from currentPrice
 * - Confidence: placeholder (static 91%)
 * - Target: uses 52-week high
 * - Sector appears as a badge
 *
 * @param {StockCardProps} props - Allowed stock data fields
 * @returns {JSX.Element} Rendered card
 * @example
 * <StockCard
 *   address1="One Apple Park Way"
 *   change24hPercent={2.27}
 *   city="Cupertino"
 *   companyName="Apple Inc."
 *   country="United States"
 *   currentPrice={268.81}
 *   dividendYield={0.004}
 *   dividendYieldPercent={0.4}
 *   fiftyTwoWeekHigh={269.08}
 *   fiftyTwoWeekLow={169.21}
 *   industry="Consumer Electronics"
 *   marketCap={3989245001728}
 *   open={264.88}
 *   peRatio={40.72}
 *   sector="Technology"
 *   state="CA"
 *   updatedAt={Date.now()}
 *   volume={44620772}
 *   website="https://www.apple.com"
 *   zip="95014"
 * />
 */
export default function StockCard({
  change24hPercent,
  city,
  companyName,
  country,
  currentPrice,
  fiftyTwoWeekHigh,
  industry,
  sector,
  state,
  updatedAt,
}: StockCardProps): React.ReactElement {
  // Formatters
  const fmtUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
  const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

  // Derived/placeholder values
  const isUp = change24hPercent >= 0;
  const arrow = isUp ? '↗' : '↘';
  const arrowColor = isUp ? '#16a34a' : '#dc2626';
  // Placeholder prediction: small nudge from current price
  const predictedPrice = currentPrice * (isUp ? 1.017 : 0.983);
  // Placeholder confidence
  const aiConfidence = 91;

  const targetPrice = fiftyTwoWeekHigh;

  // "time ago" for updatedAt
  const analyzedAgo = (() => {
    const date =
      typeof updatedAt === 'number'
        ? new Date(updatedAt)
        : typeof updatedAt === 'string'
          ? new Date(updatedAt)
          : updatedAt;
    const ms = Date.now() - (date?.getTime?.() ?? Date.now());
    const minutes = Math.max(0, Math.floor(ms / 60000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  })();

  // Naive placeholder recommendation chip (not AI)
  const recLabel = isUp ? 'BUY' : 'HOLD';

  return (
    <Card
      sx={{
        backgroundColor: '#ffffff',
        color: '#111827', // gray-900
        border: '1px solid #e5e7eb', // gray-200
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
        borderRadius: 3,
      }}
      className="w-full max-w-md"
    >
      <CardHeader
        title={
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              component="h2"
              variant="h6"
              sx={{ fontWeight: 700, color: '#111827' }}
            >
              {companyName}
            </Typography>
            <Chip
              label={sector}
              size="small"
              sx={{
                bgcolor: '#f3f4f6', // gray-100
                color: '#374151', // gray-700
                border: '1px solid #e5e7eb',
                fontWeight: 600,
              }}
            />
          </Box>
        }
        subheader={
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            {industry} • {city}, {state} • {country}
          </Typography>
        }
        sx={{ pb: 0.5 }}
      />

      <CardContent sx={{ pt: 1.5 }}>
        {/* Current Price */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="body2" sx={{ color: '#4b5563' }}>
            Current Price
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: '#111827' }}
          >
            {fmtUSD.format(currentPrice)}
          </Typography>
        </Box>

        {/* Predicted Price (placeholder) */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="body2" sx={{ color: '#4b5563' }}>
            Predicted Price
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#111827' }}
            >
              {fmtUSD.format(predictedPrice)}
            </Typography>
            <Typography variant="body2" sx={{ color: arrowColor }}>
              {arrow}
            </Typography>
          </Box>
        </Box>

        {/* 24h Change */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="body2" sx={{ color: '#4b5563' }}>
            24h Change
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isUp ? '#16a34a' : '#dc2626', fontWeight: 700 }}
          >
            {fmtPct(change24hPercent)}
          </Typography>
        </Box>

        {/* Confidence (placeholder) */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography variant="body2" sx={{ color: '#4b5563' }}>
            Confidence
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5} minWidth={160}>
            <LinearProgress
              variant="determinate"
              value={aiConfidence}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 999,
                bgcolor: '#e5e7eb',
                '& .MuiLinearProgress-bar': { bgcolor: '#10b981' },
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: '#111827' }}
            >
              {aiConfidence}%
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        <Box display="flex" gap={1} mb={1.5}>
          <Chip
            label={recLabel}
            size="small"
            sx={{
              bgcolor: '#dcfce7', // green-50
              color: '#166534', // green-800
              border: '1px solid #86efac', // green-200
              fontWeight: 700,
            }}
          />
          <Chip
            label="Low Risk"
            size="small"
            sx={{
              bgcolor: '#e0f2fe', // sky-100
              color: '#0c4a6e', // sky-900
              border: '1px solid #bae6fd', // sky-200
              fontWeight: 700,
            }}
          />
        </Box>

        <Divider sx={{ borderColor: '#e5e7eb', my: 1 }} />

        {/* Footer: Target and analyzed time */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            Target: {fmtUSD.format(targetPrice)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            Analyzed {analyzedAgo}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
