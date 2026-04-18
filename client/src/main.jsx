import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Nav         from './components/Nav.jsx';
import CheckPage   from './pages/CheckPage.jsx';
import AppealPage  from './pages/AppealPage.jsx';
import TrackerPage from './pages/TrackerPage.jsx';
import AuthPage    from './pages/AuthPage.jsx';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Nav />
      <Routes>
        <Route path="/"        element={<CheckPage />} />
        <Route path="/appeal"  element={<AppealPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/auth"    element={<AuthPage />} />
      </Routes>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
