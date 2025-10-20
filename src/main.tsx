import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
<<<<<<< HEAD
import { BrowserRouter } from 'react-router-dom';
=======
>>>>>>> origin/component/Header
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './styles/globals.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
