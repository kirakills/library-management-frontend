import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // IMPORT AUTOPROVIDER

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider> {/* WRAP APP WITH AUTHPROVIDER */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();