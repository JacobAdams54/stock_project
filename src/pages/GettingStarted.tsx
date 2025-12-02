import React from "react";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import Grid from '@mui/material/Grid';
// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import InsightsIcon from "@mui/icons-material/Insights";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PulseIcon from "@mui/icons-material/MultilineChart";
import PublicIcon from "@mui/icons-material/Public";
import PieChartIcon from '@mui/icons-material/PieChart';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
const GettingStarted: React.FC = () => {
  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* --- Fundamentals: Stock Trading Basics --- */}
        <Box textAlign="center" mb={6}>
          <Chip
            label="Fundamentals"
            color="primary"
            variant="outlined"
            sx={{ mb: 2, fontWeight: 600, borderRadius: 999 }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            Stock Trading Basics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Master these essential concepts before you start trading
          </Typography>
        </Box>

        {/* Basic concept cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <TrendingUpIcon sx={{ color: "rgb(76, 175, 80)" }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>
                  Long Position
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Buying a stock with the expectation that its price will rise. You profit when the stock price increases above your purchase price.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "rgba(244, 67, 54, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <TrendingDownIcon sx={{ color: "rgb(244, 67, 54)" }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>
                  Short Position
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Betting that a stock's price will decline. Advanced strategy that involves borrowing shares to sell, then buying them back at a lower price.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "rgba(3, 169, 244, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <PieChartIcon sx={{ color: "rgb(3, 169, 244)" }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>
                  Diversification
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Spreading investments across different stocks, sectors, and asset classes to reduce risk. Don't put all your eggs in one basket.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "rgba(255, 152, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <ShowChartIcon sx={{ color: "rgb(255, 152, 0)" }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>
                  Volatility
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  How much and how quickly a stock's price moves. Higher volatility means more risk but also more potential for gains (or losses).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Disclaimer */}
        <Alert
          severity="info"
          sx={{
            borderRadius: 3,
            mb: 10,
            py: 2.5,
            px: 3,
            alignItems: "flex-start",
            backgroundColor: "rgba(3, 169, 244, 0.08)",
            border: "1px solid rgba(3, 169, 244, 0.2)",
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: "rgb(1, 87, 155)" }}>
            Important Disclaimer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Stock trading involves risk and you can lose money. Past performance does not guarantee future results. STALK.AI provides predictions and insights as tools to inform your decisions, but you should always do your own research and never invest more than you can afford to lose. Consider consulting with a financial advisor before making investment decisions.
          </Typography>
        </Alert>

        {/* --- Our AI Features & Indicators --- */}
        <Box textAlign="center" mb={6}>
          <Chip
            label="AI Technology"
            color="secondary"
            variant="outlined"
            sx={{ mb: 2, fontWeight: 600, borderRadius: 999 }}
          />
          <Typography variant="h4" component="h2" gutterBottom>
            Our AI Features &amp; Indicators
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            STALK.AI analyzes 30+ engineered features across multiple
            categories. Each group captures a different aspect of market
            behavior to help the model classify short-term moves.
          </Typography>
        </Box>

        <Stack spacing={2.5} mb={10}>
          {/* Core Price & Volume */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(33, 150, 243, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(33, 150, 243, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <WaterfallChartIcon sx={{ fontSize: 28, color: "rgb(33, 150, 243)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(25, 118, 210)", fontWeight: 500, mb: 0.5 }}>
                  Core Price &amp; Volume (OHLCV)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Foundation of all technical analysis, tracking the essential daily price movements and trading activity.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Return-Based Features */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(76, 175, 80, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 28, color: "rgb(56, 142, 60)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(46, 125, 50)", fontWeight: 500, mb: 0.5 }}>
                  Return-Based Features
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Measures of price performance over different time horizons to identify short and long-term trends.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Volatility Measures */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(255, 152, 0, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(255, 152, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <QueryStatsIcon sx={{ fontSize: 28, color: "rgb(245, 124, 0)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(230, 81, 0)", fontWeight: 500, mb: 0.5 }}>
                  Volatility Measures
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Quantifies price fluctuation intensity to assess risk and predict potential breakouts or reversals.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Volume Dynamics */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(156, 39, 176, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(156, 39, 176, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BarChartIcon sx={{ fontSize: 28, color: "rgb(123, 31, 162)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(106, 27, 154)", fontWeight: 500, mb: 0.5 }}>
                  Volume Dynamics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Analyzes trading activity patterns to confirm price movements and identify institutional interest.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Trend & Moving-Average Structure */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(0, 188, 212, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(0, 188, 212, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <TrendingFlatIcon sx={{ fontSize: 28, color: "rgb(0, 151, 167)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(0, 131, 143)", fontWeight: 500, mb: 0.5 }}>
                  Trend &amp; Moving-Average Structure
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Identifies trend direction and strength using moving averages to filter market noise.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Momentum & Price Position */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(255, 193, 7, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(255, 193, 7, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <InsightsIcon sx={{ fontSize: 28, color: "rgb(245, 127, 23)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(255, 111, 0)", fontWeight: 500, mb: 0.5 }}>
                  Momentum &amp; Price Position
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  RSI, high-low ratio, and close position within daily range to capture overbought/oversold conditions.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* SPY-Based Market Context */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(63, 81, 181, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(63, 81, 181, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldOutlinedIcon sx={{ fontSize: 28, color: "rgb(48, 63, 159)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(40, 53, 147)", fontWeight: 500, mb: 0.5 }}>
                  SPY-Based Market Context
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  SPY returns and 20-day volatility give the model a view of the broader market environment surrounding each individual stock.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* VIX Signals */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(244, 67, 54, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(244, 67, 54, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PulseIcon sx={{ fontSize: 28, color: "rgb(211, 47, 47)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(198, 40, 40)", fontWeight: 500, mb: 0.5 }}>
                  VIX (Volatility Index) Signals
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  VIX level, change, and 20-day moving average to track market fear and stress, often preceding major moves.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Macro / Market-Regime Features */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(3, 169, 244, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(3, 169, 244, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PublicIcon sx={{ fontSize: 28, color: "rgb(2, 136, 209)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(1, 87, 155)", fontWeight: 500, mb: 0.5 }}>
                  Macro / Market-Regime Features
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  10-year yield, yield changes, risk-on ratio, and gold returns that describe the macro backdrop in which all stocks are trading.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Relative & Correlation Indicators */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "2px solid",
              borderColor: "rgba(156, 39, 176, 0.3)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: "rgba(156, 39, 176, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <StackedLineChartIcon sx={{ fontSize: 28, color: "rgb(123, 31, 162)" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: "rgb(106, 27, 154)", fontWeight: 500, mb: 0.5 }}>
                  Relative &amp; Correlation Indicators
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Correlation to SPY and relative strength metrics that show how a stock behaves versus the broader market and its peers.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default GettingStarted;