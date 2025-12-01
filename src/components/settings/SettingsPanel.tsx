/**
 * SettingsPanel component
 *
 * UI for editing user dashboard settings. This component is intentionally a
 * presentational skeleton to start TDD; each control is wired to the
 * `useUserSettings` hook. Guest users (no `uid`) will see the controls disabled
 * with a call-to-action to sign in.
 *
 * Accessibility: controls include accessible labels and keyboard handlers.
 *
 * Placement: `src/components/settings/SettingsPanel.tsx` — imported into the
 * Dashboard tabbed navigation.
 */
import React from 'react';
import useUserSettings from '../../hooks/useUserSettings';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

type Props = {
  uid?: string | null;
};

export default function SettingsPanel({ uid }: Props) {
  const { settings, loading, error, updateSetting, bulkUpdate, resetSettings } = useUserSettings(uid ?? null);

  const isGuest = !uid;

  function setNested(path: string, value: any) {
    const [top] = path.split('.');
    const partial: any = { [top]: { ...(settings as any)[top] } };
    const keys = path.split('.');
    let cursor = partial[top];
    for (let i = 1; i < keys.length - 1; i++) {
      const k = keys[i];
      cursor[k] = { ...(cursor[k] || {}) };
      cursor = cursor[k];
    }
    cursor[keys[keys.length - 1]] = value;
    bulkUpdate(partial).catch(() => {
      // error will be surfaced via the hook's `error` value and shown in a Snackbar
    });
  }

  const [snackOpen, setSnackOpen] = React.useState(false);
  React.useEffect(() => {
    if (error) setSnackOpen(true);
  }, [error]);

  const handleSnackClose = (_: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  return (
    <Box component="section" role="region" aria-label="Settings Panel" sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Settings
      </Typography>

      {loading && <Typography>Loading settings…</Typography>}
      {error && <Typography color="error">Failed to load settings</Typography>}

      {isGuest ? (
        <Box role="alert" sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography>Sign in to save and customize your dashboard settings.</Typography>
          <Button variant="contained" sx={{ mt: 1 }} onClick={() => (window.location.assign('/login'), undefined)}>
            Sign in
          </Button>
        </Box>
      ) : (
        <Box component="form" aria-disabled={isGuest} onSubmit={(e) => e.preventDefault()} sx={{ display: 'grid', gap: 2 }}>
          <Box>
            <Typography variant="h6" id="ui-controls">
              UI Controls
            </Typography>

            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel id="layout-label">Layout</InputLabel>
              <Select
                labelId="layout-label"
                value={settings.layout}
                label="Layout"
                onChange={(e) => updateSetting('layout', e.target.value).catch(() => {})}
                disabled={isGuest}
              >
                <MenuItem value="compact">Compact</MenuItem>
                <MenuItem value="expanded">Expanded</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Refresh interval (sec)"
              type="number"
              inputProps={{ min: 5 }}
              size="small"
              value={settings.refreshIntervalSeconds}
              onChange={(e) => updateSetting('refreshIntervalSeconds', Number(e.target.value)).catch(() => {})}
              disabled={isGuest}
              sx={{ mt: 1 }}
            />

            <FormControlLabel
              control={<Switch checked={settings.showPortfolioWidgets} onChange={(e) => updateSetting('showPortfolioWidgets', e.target.checked).catch(() => {})} disabled={isGuest} />}
              label="Show portfolio widgets"
            />

            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel id="chart-style-label">Chart style</InputLabel>
              <Select
                labelId="chart-style-label"
                value={settings.chartStyle}
                label="Chart style"
                onChange={(e) => updateSetting('chartStyle', e.target.value).catch(() => {})}
                disabled={isGuest}
              >
                <MenuItem value="candles">Candles</MenuItem>
                <MenuItem value="lines">Lines</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel id="watchlist-sort-label">Watchlist sort order</InputLabel>
              <Select
                labelId="watchlist-sort-label"
                value={settings.watchlistSortOrder}
                label="Watchlist sort order"
                onChange={(e) => updateSetting('watchlistSortOrder', e.target.value).catch(() => {})}
                disabled={isGuest}
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
                <MenuItem value="change_desc">Change ↓</MenuItem>
                <MenuItem value="change_asc">Change ↑</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={settings.experimentalFeatures} onChange={(e) => updateSetting('experimentalFeatures', e.target.checked).catch(() => {})} disabled={isGuest} />}
              label="Experimental features"
            />
          </Box>

          <Box>
            <Typography variant="h6" id="notifications">
              Notifications
            </Typography>

            <FormControlLabel
              control={<Switch checked={settings.notifications.enabled} onChange={(e) => setNested('notifications.enabled', e.target.checked)} disabled={isGuest} />}
              label="Enable notifications"
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={<Switch checked={settings.notifications.channels.email} onChange={(e) => setNested('notifications.channels.email', e.target.checked)} disabled={isGuest} />}
                label="Email"
              />
              <FormControlLabel
                control={<Switch checked={settings.notifications.channels.push} onChange={(e) => setNested('notifications.channels.push', e.target.checked)} disabled={isGuest} />}
                label="Push/In-app"
              />
            </Box>

            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel id="notif-frequency">Frequency</InputLabel>
              <Select labelId="notif-frequency" value={settings.notifications.frequency} label="Frequency" onChange={(e) => setNested('notifications.frequency', e.target.value)} disabled={isGuest}>
                <MenuItem value="immediate">Immediate</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily digest</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Price alert threshold"
              type="number"
              inputProps={{ min: 0 }}
              size="small"
              value={settings.notifications.priceAlertThreshold ?? ''}
              onChange={(e) => setNested('notifications.priceAlertThreshold', e.target.value === '' ? undefined : Number(e.target.value))}
              disabled={isGuest}
              sx={{ mt: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="h6" id="preferences">
              User Preferences
            </Typography>

            <TextField label="Time zone" size="small" value={settings.preferences.timezone} onChange={(e) => setNested('preferences.timezone', e.target.value)} disabled={isGuest} sx={{ mt: 1 }} />

            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select labelId="currency-label" value={settings.preferences.currency} label="Currency" onChange={(e) => setNested('preferences.currency', e.target.value)} disabled={isGuest}>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" sx={{ mt: 1 }}>
              <FormLabel component="legend">Theme</FormLabel>
              <RadioGroup row value={settings.preferences.theme} onChange={(e) => setNested('preferences.theme', e.target.value)}>
                <FormControlLabel value="light" control={<Radio />} label="Light" disabled={isGuest} />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" disabled={isGuest} />
                <FormControlLabel value="system" control={<Radio />} label="System" disabled={isGuest} />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Number decimals"
              type="number"
              inputProps={{ min: 0, max: 8 }}
              size="small"
              value={settings.preferences.numberFormat.decimalPlaces}
              onChange={(e) => setNested('preferences.numberFormat.decimalPlaces', Number(e.target.value))}
              disabled={isGuest}
              sx={{ mt: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="h6">Advanced / Misc</Typography>
            <FormControlLabel
              control={<Switch checked={settings.advanced?.dataRetentionEnabled ?? false} onChange={(e) => setNested('advanced.dataRetentionEnabled', e.target.checked)} disabled={isGuest} />}
              label="Data retention"
            />
            <FormControlLabel
              control={<Switch checked={settings.advanced?.telemetryOptIn ?? false} onChange={(e) => setNested('advanced.telemetryOptIn', e.target.checked)} disabled={isGuest} />}
              label="Telemetry opt-in"
            />
            <Button variant="outlined" disabled sx={{ mt: 1 }}>
              Export settings (UI only)
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="contained" color="primary" onClick={() => resetSettings().catch(() => {})} disabled={isGuest}>
              Reset to defaults
            </Button>
          </Box>
        </Box>
      )}
      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={handleSnackClose} severity="error" elevation={6} variant="filled">
          Failed to save settings. Please try again.
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

