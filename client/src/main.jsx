import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CheckPage   from './pages/CheckPage.jsx';
import AppealPage  from './pages/AppealPage.jsx';
import TrackerPage from './pages/TrackerPage.jsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<CheckPage />} />
        <Route path="/appeal"  element={<AppealPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
