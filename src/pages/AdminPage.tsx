// src/pages/AdminPage.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import { useAuth } from '../components/layout/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import useAdminMetrics from '../hooks/useAdminMetrics';
import { logAppEvent } from '../firebase/firebase';

/**
 * AdminPage
 * Lightweight admin dashboard:
 * - Restricts access to admins
 * - Shows basic metrics
 * - Toggles feature flags
 * - Provides an Analytics test action
 */
export default function AdminPage(): JSX.Element {
  const { user, isAdmin } = useAuth();
  const { metrics, flags, setFlag, loading, error } = useAdminMetrics();

  // Non-admin / unauthenticated view
  if (!user || !isAdmin) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          Admin
        </Typography>
        <Card>
          <CardHeader title="Access restricted" />
          <CardContent>
            <Typography color="text.secondary">
              You need admin privileges to view this page.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Admin dashboard view
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header + test event button */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography color="text.secondary">
              Basic analytics, flags, and utilities for class demos.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => logAppEvent('admin_test_click', { at: Date.now() })}
            aria-label="Log test analytics event"
          >
            Log test event
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Sidebar – hidden on small screens via CSS but still in DOM */}
          <Grid
            item
            lg={3}
            sx={{ display: { xs: 'none', lg: 'block' } }}
          >
            <Sidebar />
          </Grid>

          {/* Main content */}
          <Grid item xs={12} lg={9}>
            <Grid container spacing={3}>
              {/* Metrics cards */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardHeader title="Total users" />
                  <CardContent>
                    <Typography variant="h3">
                      {loading ? '—' : metrics.totalUsers ?? 0}
                    </Typography>
                    {error && (
                      <Typography color="error" variant="caption">
                        {error}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardHeader title="Watchlist items" />
                  <CardContent>
                    <Typography variant="h3">
                      {loading ? '—' : metrics.totalWatchlistItems ?? 0}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      Approximate (sampled, max 500 users)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardHeader title="Avg. watchlist size" />
                  <CardContent>
                    <Typography variant="h3">
                      {loading ? '—' : metrics.avgWatchlistSize ?? 0}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      Approximate over sampled users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top tickers */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Top tickers in watchlists" />
                  <CardContent>
                    {loading ? (
                      <Typography color="text.secondary">Loading…</Typography>
                    ) : metrics.topTickers.length === 0 ? (
                      <Typography color="text.secondary">No data</Typography>
                    ) : (
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {metrics.topTickers.map((t) => (
                          <Chip
                            key={t.ticker}
                            label={`${t.ticker} (${t.count})`}
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Feature flags */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Feature flags" />
                  <CardContent>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={flags.maintenanceMode}
                            onChange={(_, v) => setFlag('maintenanceMode', v)}
                          />
                        }
                        label="Maintenance mode"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={flags.experimentalCharts}
                            onChange={(_, v) =>
                              setFlag('experimentalCharts', v)
                            }
                          />
                        }
                        label="Experimental charts"
                      />
                      <Typography color="text.secondary" variant="caption">
                        Flags are stored at <code>config/flags</code> in
                        Firestore.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tips card */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Admin tips (for students)" />
                  <CardContent>
                    <ul>
                      <li>
                        Instrument key user actions with <code>logAppEvent</code>{' '}
                        (e.g., <code>login</code>, <code>add_to_watchlist</code>
                        , <code>view_stock_detail</code>).
                      </li>
                      <li>
                        Export watchlists to CSV for class analysis
                        (client-only, no PII).
                      </li>
                      <li>
                        Add a “Refresh demo data” stub that just logs an
                        Analytics event.
                      </li>
                      <li>
                        Cap Firestore reads for metrics and label them as
                        approximate.
                      </li>
                      <li>
                        Add quick links to Firebase Console for Analytics and
                        Firestore.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
