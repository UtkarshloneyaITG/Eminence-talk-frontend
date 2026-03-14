import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import CursorManager from '@/components/cursor/CursorManager';
import { connectSocket } from '@/lib/socket';

// Lazy-load pages for code splitting
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Chat = lazy(() => import('@/pages/Chat'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));

// Modals
import { AnimatePresence as AP } from 'framer-motion';

const PageLoader = () => (
  <div className="min-h-screen bg-space-950 flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/chat" replace />;
};

const App = () => {
  const { isAuthenticated, fetchMe, accessToken } = useAuthStore();
  const { modal, closeModal } = useUIStore();

  // Hydrate auth state
  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
      const token = localStorage.getItem('et_access_token');
      if (token) connectSocket(token);
    }
  }, []);

  return (
    <BrowserRouter>
      {/* Custom cursor */}
      <CursorManager />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,15,42,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to={isAuthenticated ? '/chat' : '/login'} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {/* Global Settings Modal */}
      <AnimatePresence>
        {modal === 'settings' && (
          <Suspense fallback={null}>
            <Settings onClose={closeModal} />
          </Suspense>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;
