import { Box, Typography } from '@mui/material';
import Footer from './components/layout/Footer';
import SignupForm from './components/auth/SignupForm';
import Header from './components/layout/Header';

function App() {
  return (
    <>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Box
          sx={{
            flex: 1, // fills the available vertical space
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" component="h1">
            Stock Predictor - Coming Soon
          </Typography>
          <Box sx={{ mt: 4, width: '100%', maxWidth: 400 }}>
            <SignupForm />
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}

export default App;
