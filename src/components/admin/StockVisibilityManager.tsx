/**
 * StockVisibilityManager Component
 *
 * Admin-only interface for toggling stock visibility.
 * Allows admins to show/hide stocks from regular users.
 *
 * @module components/admin/StockVisibilityManager
 */
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import {
  readAllStockSummaries,
  type StockRealtime,
} from '../../hooks/useStockData';

/**
 * StockVisibilityManager - Admin interface for controlling stock visibility
 */
export default function StockVisibilityManager() {
  const [stocks, setStocks] = useState<StockRealtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  // Load all stocks on mount
  useEffect(() => {
    loadStocks();
  }, []);

  /** Fetch all stock summaries from Firestore */
  const loadStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const allStocks = await readAllStockSummaries();
      setStocks(allStocks.sort((a, b) => a.symbol.localeCompare(b.symbol)));
    } catch (err) {
      setError(`Failed to load stocks: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  /** Toggle visibility for a specific stock */
  const toggleVisibility = async (
    symbol: string,
    currentVisibility: boolean
  ) => {
    setUpdating((prev) => new Set(prev).add(symbol));

    try {
      const stockRef = doc(db, 'stocks', symbol);
      await updateDoc(stockRef, {
        isVisible: !currentVisibility,
      });

      // Update local state optimistically
      setStocks((prevStocks) =>
        prevStocks.map((stock) =>
          stock.symbol === symbol
            ? { ...stock, isVisible: !currentVisibility }
            : stock
        )
      );
    } catch (err) {
      setError(`Failed to update ${symbol}: ${(err as Error).message}`);
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(symbol);
        return next;
      });
    }
  };

  // Filter stocks based on search query
  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count visible/hidden stocks
  const visibleCount = stocks.filter((s) => s.isVisible).length;
  const hiddenCount = stocks.length - visibleCount;

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Stock Visibility Management"
        subheader={`${visibleCount} visible • ${hiddenCount} hidden • ${stocks.length} total`}
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search bar */}
        <TextField
          fullWidth
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Stock list */}
        <Stack spacing={1} sx={{ maxHeight: 500, overflowY: 'auto' }}>
          {filteredStocks.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
              No stocks found
            </Typography>
          ) : (
            filteredStocks.map((stock) => (
              <Box
                key={stock.symbol}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: stock.isVisible
                    ? 'background.paper'
                    : 'action.hover',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {stock.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stock.companyName}
                  </Typography>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={stock.isVisible}
                      onChange={() =>
                        toggleVisibility(stock.symbol, stock.isVisible)
                      }
                      disabled={updating.has(stock.symbol)}
                    />
                  }
                  label={stock.isVisible ? 'Visible' : 'Hidden'}
                  labelPlacement="start"
                />
              </Box>
            ))
          )}
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2 }}
        >
          Hidden stocks will not appear for regular users. Admins can always see
          all stocks.
        </Typography>
      </CardContent>
    </Card>
  );
}
