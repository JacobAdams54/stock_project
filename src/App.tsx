import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';
import { FeatureCards } from './components/layout/FeatureCard';
import { AccessTime, Psychology, Visibility } from '@mui/icons-material';
import SignupForm from './components/auth/SignupForm';
// import LoginForm from './components/auth/LoginForm';
import { Routes, Route } from 'react-router-dom';
import StockListingPage from './pages/StockListingPage';
import StockDetail from './pages/StockDetail';

function App() {
  const homepageFeatures = [
    {
      icon: AccessTime,
      title: 'Real-time Data',
      description: 'Live market feeds and instant updates.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Psychology,
      title: 'AI Predictions',
      description: 'Machine learning driven buy/sell signals.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Visibility,
      title: 'Custom Watchlists',
      description: 'Track the stocks that matter to you.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <FeatureCards features={homepageFeatures} />
            </>
          }
        />
        <Route path="/signup" element={<SignupForm />} />
        {/* New: Stocks listing and detail routes */}
        <Route path="/stocks" element={<StockListingPage />} />
        <Route path="/stocks/:symbol" element={<StockDetail />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
