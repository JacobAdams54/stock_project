import { Box } from '@mui/material';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Hero from './components/layout/Hero'

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
        <Hero />
        <Box
          sx={{
            flex: 1, // fills the available vertical space
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mt: 4, width: '100%', maxWidth: 400 }}></Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}

export default App;
