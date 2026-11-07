import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './scroll.css';
import './index.css';
import './glass-neon.css';
import './intro.css';
import './mobile.css';
import './header.css';
import './glassFx.js';
import './i18n';
import { ThemeProvider } from './context/ThemeContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
