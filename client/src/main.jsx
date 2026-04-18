import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav         from './components/Nav.jsx';
import CheckPage   from './pages/CheckPage.jsx';
import AppealPage  from './pages/AppealPage.jsx';
import TrackerPage from './pages/TrackerPage.jsx';
import './index.css';

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/"        element={<CheckPage />} />
        <Route path="/appeal"  element={<AppealPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
      </Routes>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
