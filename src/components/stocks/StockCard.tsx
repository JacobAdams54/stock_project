/**
 * @file StockCard.tsx
 * @description Light stock summary card displaying real-time stock data and AI predictions.
 * Shows BUY/SELL recommendations based on AI model predictions when available.
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
import type { PredictionData } from '../../hooks/useStockData';

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
  aiPrediction?: PredictionData;
};

/**
 * A presentational stock card that renders company info, price,
 * 24h change, AI prediction confidence, and recommendation tags.
 *
 * - Confidence: AI prediction probability when available
 * - Recommendation: BUY/SELL based on AI prediction direction
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
  aiPrediction,
}: StockCardProps): React.ReactElement {
  // Formatters
  const fmtUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
  const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

  // Derived values
  const isUp = change24hPercent >= 0;

  // Use AI confidence if available, otherwise fallback to 91%
  const aiConfidence = aiPrediction
    ? Math.round(aiPrediction.probability * 100)
    : 91;

  const targetPrice = fiftyTwoWeekHigh;

  // Recommendation based on AI prediction, or fallback to 24h change
  const recLabel = aiPrediction
    ? aiPrediction.direction === 'up'
      ? 'BUY'
      : 'SELL'
    : isUp
      ? 'BUY'
      : 'HOLD';

  // Risk level based on AI confidence/probability
  const riskLevel = aiPrediction
    ? aiPrediction.probability < 0.25
      ? 'High Risk'
      : aiPrediction.probability < 0.5
        ? 'Risky'
        : 'Low Risk'
    : 'Low Risk'; // fallback when no AI prediction

  // Risk chip styling based on level
  const riskChipStyle =
    riskLevel === 'Low Risk'
      ? {
          bgcolor: '#e0f2fe', // sky-100
          color: '#0c4a6e', // sky-900
          border: '1px solid #bae6fd', // sky-200
        }
      : riskLevel === 'Risky'
        ? {
            bgcolor: '#fef3c7', // amber-100
            color: '#78350f', // amber-900
            border: '1px solid #fde68a', // amber-200
          }
        : {
            bgcolor: '#fee2e2', // red-50
            color: '#991b1b', // red-800
            border: '1px solid #fecaca', // red-200
          };

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
              bgcolor:
                recLabel === 'BUY'
                  ? '#dcfce7' // green-50
                  : recLabel === 'SELL'
                    ? '#fee2e2' // red-50
                    : '#f3f4f6', // gray-100 for HOLD
              color:
                recLabel === 'BUY'
                  ? '#166534' // green-800
                  : recLabel === 'SELL'
                    ? '#991b1b' // red-800
                    : '#374151', // gray-700 for HOLD
              border:
                recLabel === 'BUY'
                  ? '1px solid #86efac' // green-200
                  : recLabel === 'SELL'
                    ? '1px solid #fecaca' // red-200
                    : '1px solid #e5e7eb', // gray-200 for HOLD
              fontWeight: 700,
            }}
          />
          <Chip
            label={riskLevel}
            size="small"
            sx={{
              ...riskChipStyle,
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
            Analyzed today
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
