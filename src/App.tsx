import { Box, Typography } from '@mui/material';
import Footer from "./components/layout/Footer";
import Hero from './components/layout/Hero';


function App() {
  return (
    <>
      <Hero />
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Box sx={{
          flex: 1, // fills the available vertical space
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
      }}>
        <Typography variant="h4" component="h1">
          Stock Predictor - Coming Soon
        </Typography>
      </Box>
      
      </Box>
      <Footer />
    </>
  );
}

export default App;

