import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#f0f0f5',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#00d68f', secondary: '#0a0a0f' },
            },
            error: {
              iconTheme: { primary: '#ff6b6b', secondary: '#0a0a0f' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
