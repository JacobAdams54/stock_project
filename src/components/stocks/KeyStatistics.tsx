import { Box, Typography, Paper } from '@mui/material';

/**
 * Key statistics data interface
 * @interface KeyStatisticsProps
 */
interface KeyStatisticsProps {
  companyName: string;
  sector: string;
  marketCap: number; // number from summary; formatted internally
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

/**
 * Key Statistics component
 * Displays essential stock metrics in a horizontal row layout
 *
 * @description
 * Pure presentational component that displays 5 key metrics about a stock.
 * Follows "dumb component" pattern - receives all data via props, no data fetching.
 * Responsive design: wraps to 2 columns on mobile, single row on desktop.
 *
 * @param {KeyStatisticsProps} props - Component props
 * @returns {JSX.Element} Key statistics display component
 *
 * @example
 * <KeyStatistics
 *   companyName="Apple Inc."
 *   sector="Technology"
 *   marketCap={2750000000000}
 *   fiftyTwoWeekHigh={199.62}
 *   fiftyTwoWeekLow={124.17}
 * />
 */
const KeyStatistics = ({
  companyName,
  sector,
  marketCap,
  fiftyTwoWeekHigh,
  fiftyTwoWeekLow,
}: KeyStatisticsProps) => {
  const fmtCompact = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Key Statistics
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 4,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        {/* Full Company Name */}
        <Box sx={{ minWidth: { xs: '45%', md: 'auto' } }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Company
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {companyName}
          </Typography>
        </Box>

        {/* Sector */}
        <Box sx={{ minWidth: { xs: '45%', md: 'auto' } }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Sector
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {sector}
          </Typography>
        </Box>

        {/* Market Cap */}
        <Box sx={{ minWidth: { xs: '45%', md: 'auto' } }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            Market Cap
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {fmtCompact.format(marketCap)}
          </Typography>
        </Box>

        {/* 52 Week High */}
        <Box sx={{ minWidth: { xs: '45%', md: 'auto' } }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            52W High
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            ${fiftyTwoWeekHigh.toFixed(2)}
          </Typography>
        </Box>

        {/* 52 Week Low */}
        <Box sx={{ minWidth: { xs: '45%', md: 'auto' } }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            52W Low
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            ${fiftyTwoWeekLow.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default KeyStatistics;
