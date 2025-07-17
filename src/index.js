import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
//import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
// Register service worker
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('Service worker registration successful', registration);
  },
  onUpdate: (registration) => {
    console.log('New content available; please refresh.', registration);
    // You can add logic here to show an update prompt to users
  }
});
// Optional: Performance monitoring
//reportWebVitals();