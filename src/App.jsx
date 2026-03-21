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
const NewChatModal = lazy(() => import('@/components/modals/NewChatModal'));
const NewGroupModal = lazy(() => import('@/components/modals/NewGroupModal'));

const PageLoader = () => (
  <div className="min-h-screen bg-base flex items-center justify-center">
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

// bgBase for each scene (mirrors BG_SCENES in Settings.jsx)
const SCENE_BG_BASE = {
  cosmos: '#050510',
  aurora: '#020f0a',
  ember:  '#100502',
  ocean:  '#020510',
  neon:   '#0a0010',
};

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
};

const App = () => {
  const { isAuthenticated, fetchMe, accessToken } = useAuthStore();
  const { modal, closeModal, accentColor, bgScene } = useUIStore();

  // Sync accent color to CSS custom property so all components react to it
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
  }, [accentColor]);

  // Sync bgScene to --bg-base / --bg-surface CSS variables
  useEffect(() => {
    const base = SCENE_BG_BASE[bgScene] ?? SCENE_BG_BASE.cosmos;
    const [r, g, b] = hexToRgb(base);
    document.documentElement.style.setProperty('--bg-base', base);
    document.documentElement.style.setProperty('--bg-base-rgb', `${r}, ${g}, ${b}`);
    // Surface = slightly lighter variant for popups/modals
    const sr = Math.min(255, r + 5), sg = Math.min(255, g + 5), sb = Math.min(255, b + 10);
    document.documentElement.style.setProperty('--bg-surface', `rgb(${sr},${sg},${sb})`);
    document.documentElement.style.setProperty('--bg-surface-rgb', `${sr}, ${sg}, ${sb}`);
  }, [bgScene]);

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
            background: 'rgba(var(--bg-surface-rgb), 0.95)',
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
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to={isAuthenticated ? '/chat' : '/login'} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {/* Global Modals */}
      <AnimatePresence>
        {modal === 'newChat' && (
          <Suspense fallback={null}>
            <NewChatModal />
          </Suspense>
        )}
        {modal === 'newGroup' && (
          <Suspense fallback={null}>
            <NewGroupModal />
          </Suspense>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;
