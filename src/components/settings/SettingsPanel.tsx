/**
 * SettingsPanel Component
 *
 * Simplified settings interface for managing user preferences:
 * 1. Watchlist management (add/remove stocks)
 * 2. AI model selection (with premium access control)
 *
 * @module components/settings/SettingsPanel
 */
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  TextField,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import useUserSettings from '../../hooks/useUserSettings';
import { useAuth } from '../layout/AuthContext';
import { TICKERS, type Ticker } from '../../constants/tickers';
import Sidebar from '../layout/Sidebar';

/** AI Model definitions */
const AI_MODELS = [
  {
    id: 'arimax' as const,
    name: 'ARIMAX',
    description:
      'AutoRegressive Integrated Moving Average with eXogenous variables',
    isPremium: false,
  },
  {
    id: 'dl' as const,
    name: 'Deep Learning',
    description: 'Advanced neural network-based predictions',
    isPremium: true,
  },
] as const;

/**
 * SettingsPanel - User preferences management
 */
export default function SettingsPanel() {
  const { user } = useAuth();
  const {
    preferences,
    loading,
    error,
    updatePreferredModel,
    addToWatchlist,
    removeFromWatchlist,
  } = useUserSettings();

  const [selectedStock, setSelectedStock] = useState<Ticker | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guest protection
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          sx={{ display: 'flex', width: '100%', maxWidth: 'lg', gap: 3, p: 3 }}
        >
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="info">
              Please log in to manage your preferences.
            </Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  // Loading state
  if (loading) {
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
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box
          sx={{ display: 'flex', width: '100%', maxWidth: 'lg', gap: 3, p: 3 }}
        >
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">
              Failed to load preferences: {error.message}
            </Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  /** Handle AI model change */
  const handleModelChange = async (model: 'arimax' | 'dl') => {
    // Check if user has access to this model
    if (!preferences.availableModels.includes(model)) {
      setSaveError('You do not have access to this model. Upgrade to premium!');
      return;
    }

    try {
      setSaveError(null);
      await updatePreferredModel(model);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    } catch (_err) {
      setSaveError('Failed to update AI model preference');
    }
  };

  /** Add stock to watchlist */
  const handleAddToWatchlist = async () => {
    if (!selectedStock) return;

    try {
      setSaveError(null);
      await addToWatchlist(selectedStock);
      setSelectedStock(null); // Clear selection
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (_err) {
      setSaveError('Failed to add stock to watchlist');
    }
  };

  /** Remove stock from watchlist */
  const handleRemoveFromWatchlist = async (ticker: Ticker) => {
    try {
      setSaveError(null);
      await removeFromWatchlist(ticker);
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (_err) {
      setSaveError('Failed to remove stock from watchlist');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box
        sx={{ display: 'flex', width: '100%', maxWidth: 'lg', gap: 3, p: 3 }}
      >
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h4" gutterBottom>
            Preferences
          </Typography>

          {saveError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setSaveError(null)}
            >
              {saveError}
            </Alert>
          )}

          {/* AI Model Selection */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Prediction Model
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select which AI model to use for stock predictions
            </Typography>

            <FormControl fullWidth>
              <InputLabel id="ai-model-label">Prediction Model</InputLabel>
              <Select
                labelId="ai-model-label"
                value={preferences.preferredModel}
                label="Prediction Model"
                onChange={(e) =>
                  handleModelChange(e.target.value as 'arimax' | 'dl')
                }
              >
                {AI_MODELS.map((model) => {
                  const hasAccess = preferences.availableModels.includes(
                    model.id
                  );
                  return (
                    <MenuItem
                      key={model.id}
                      value={model.id}
                      disabled={!hasAccess}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          width: '100%',
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {model.name}
                            {model.isPremium && (
                              <Chip
                                label="Premium"
                                size="small"
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                        {!hasAccess && (
                          <Chip label="Locked" size="small" color="default" />
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              Current model:{' '}
              <strong>{preferences.preferredModel.toUpperCase()}</strong>
            </Typography>
          </Paper>

          {/* Watchlist Management */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Watchlist
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add stocks to track their performance and predictions
            </Typography>

            {/* Add Stock */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Autocomplete
                value={selectedStock}
                onChange={(_, newValue) => setSelectedStock(newValue)}
                options={TICKERS}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} label="Search stock ticker" />
                )}
                sx={{ flexGrow: 1 }}
                isOptionEqualToValue={(option, value) => option === value}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    option.toLowerCase().includes(inputValue.toLowerCase())
                  )
                }
              />
              <Button
                variant="contained"
                onClick={handleAddToWatchlist}
                disabled={
                  !selectedStock ||
                  preferences.watchlist.includes(selectedStock)
                }
              >
                Add
              </Button>
            </Box>

            {/* Watchlist Display */}
            {preferences.watchlist.length === 0 ? (
              <Alert severity="info">
                Your watchlist is empty. Add some stocks!
              </Alert>
            ) : (
              <List>
                {preferences.watchlist.map((ticker) => (
                  <ListItem key={ticker} divider>
                    <ListItemText
                      primary={ticker}
                      secondary={`Tracking ${ticker} stock`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveFromWatchlist(ticker)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: 'block' }}
            >
              {preferences.watchlist.length} stock
              {preferences.watchlist.length !== 1 ? 's' : ''} in watchlist
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
