import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import custom global styles
import './App.css';

// Import the main App component
import AppWithAuth from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <BrowserRouter>  {/* <-- WRAP YOUR APP */}
      <AppWithAuth />
    </BrowserRouter>
  </React.StrictMode>
);