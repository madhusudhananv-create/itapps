import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CSATProvider } from './context/CSATContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CSATProvider>
      <App />
    </CSATProvider>
  </React.StrictMode>
); 