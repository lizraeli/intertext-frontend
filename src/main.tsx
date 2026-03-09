import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { JourneyProvider } from './context/JourneyContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JourneyProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </JourneyProvider>
  </StrictMode>,
);
