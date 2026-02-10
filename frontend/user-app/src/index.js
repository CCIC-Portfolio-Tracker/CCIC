import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Creates a React root and attaches it to the DOM element with the id 'root'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

