import { Box, Typography } from '@mui/material';

function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Typography variant="h4" component="h1">
        Stock Predictor - Coming Soon
      </Typography>
    </Box>
  );
}

export default App;