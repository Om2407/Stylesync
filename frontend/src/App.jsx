import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1a1a1a', color: '#f0f0f0', border: '1px solid #3d3d3d', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
          success: { iconTheme: { primary: '#10b981', secondary: '#0d0d0d' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0d0d0d' } },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
