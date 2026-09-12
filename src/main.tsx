import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyTheme, useThemeStore } from './stores/theme';
import './index.css';

applyTheme(useThemeStore.getState().mode);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);