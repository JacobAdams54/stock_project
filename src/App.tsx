import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './components/layout/Sidebar';

// Placeholder components for your pages
function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}

function Predictions() {
  return (
    <div>
      <h1>Predictions</h1>
    </div>
  );
}

function Watchlist() {
  return (
    <div>
      <h1>Watchlist</h1>
    </div>
  );
}

function Settings() {
  return (
    <div>
      <h1>Settings</h1>
    </div>
  );
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: `240px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Stock Predictor
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
