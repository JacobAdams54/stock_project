import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';
import { FeatureCards } from './components/layout/FeatureCard';
import { AccessTime, Psychology, Visibility } from '@mui/icons-material';
import SignupForm from './pages/auth/SignupForm.tsx';
import LoginForm from './pages/auth/LoginForm.tsx';
import { Routes, Route } from 'react-router-dom';
import StockListingPage from './pages/StockListingPage';
import StockDetail from './pages/StockDetail';
import About from './pages/About';
import ForgotPasswordPage from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import GettingStarted from './pages/GettingStarted';
import SettingsPanel from './components/settings/SettingsPanel';
import PredictionsPage from './pages/PredictionsPage';

import { AuthProvider, AdminRoute } from './components/layout/AuthContext.tsx';

function App() {
  const homepageFeatures = [
    {
      icon: AccessTime,
      title: 'Daily Updates',
      description: 'Stay informed with daily market updates and insights.',
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
    <AuthProvider>
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
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/stocks" element={<StockListingPage />} />
        <Route path="/stocks/:symbol" element={<StockDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gettingstarted" element={<GettingStarted />} />
        <Route path="/settings" element={<SettingsPanel />} />
        <Route path="/predictions" element={<PredictionsPage />} />

        {/* ⬇️ UPDATED: protect /admin with the AdminRoute guard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>

      <Footer />
    </AuthProvider>
  );
}

export default App;
