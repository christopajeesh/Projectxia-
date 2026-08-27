import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SoundProvider } from './context/SoundContext';
import { CartProvider } from './context/CartContext';

// Core UI Components (Eagerly loaded)
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import AuthModal from './components/ui/AuthModal';
import CartDrawer from './components/ui/CartDrawer';
import CheckoutModal from './components/ui/CheckoutModal';
import NotificationToast from './components/ui/NotificationToast';
import ProtectedRoute from './components/ProtectedRoute';
import SmoothScroll from './components/ui/SmoothScroll';
import SpotlightGlow from './components/ui/SpotlightGlow';
import BackgroundCanvas from './components/ui/BackgroundCanvas';
import InitialLoader from './components/ui/InitialLoader';

// Lazy-Loaded Page Components for Zero-Lag Initial Mobile Load
const LandingPage = lazy(() => import('./pages/LandingPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const UploadProjectPage = lazy(() => import('./pages/UploadProjectPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AiShieldPage = lazy(() => import('./pages/AiShieldPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Animated Page Routes with Framer Motion Transition
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute reason="Please log in or register to access verified projects in ProjectXia Marketplace.">
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute reason="Please log in or register to view project details, circuit schematics, and source code.">
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute reason="Please log in or register to list and monetize your engineering project.">
                <UploadProjectPage />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute reason="Please log in or register to view your verified creator profile.">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute reason="Please log in or register to use real-time direct creator messaging.">
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-shield"
            element={
              <ProtectedRoute reason="Please log in or register to access the AI Plagiarism & Code Integrity Scanner.">
                <AiShieldPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/core-os" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

// Futuristic Cyber Loading Skeleton for Route Transitions
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500/20 animate-ping" />
      <div className="absolute inset-0 rounded-2xl border-2 border-t-cyan-400 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
      <div className="absolute inset-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center">
        <span className="text-cyan-400 font-mono text-xs font-black">PX</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      <p className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
        Initializing Quantum Matrix...
      </p>
    </div>
  </div>
);

// Auto-scroll to top on every navigation or page load
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <SocketProvider>
          <SoundProvider>
            <CartProvider>
              <SmoothScroll>
                <div className="flex flex-col min-h-screen bg-transparent text-neutral-200 font-sans selection:bg-[#00ffaa] selection:text-black relative overflow-x-hidden">
                  {/* High-Tech Initial Load Splash Screen */}
                  <InitialLoader />

                  {/* Interactive Mouse Spotlight Aura */}
                  <SpotlightGlow />

                  {/* Real-time Animated Particle & Mesh Background Canvas */}
                  <BackgroundCanvas />

                {/* Top Navigation */}
                <div className="relative z-20">
                  <Navbar />
                </div>

                {/* Main Content Viewport with Suspense Route Splitting & Page Transitions */}
                <main className="flex-1 relative z-10">
                  <Suspense fallback={<PageLoader />}>
                    <AnimatedRoutes />
                  </Suspense>
                </main>

                {/* Footer */}
                <div className="relative z-10">
                  <Footer />
                </div>

                {/* Persistent Authentication Modal */}
                <AuthModal />

                {/* Engineering Cart Drawer & Instant Checkout */}
                <CartDrawer />
                <CheckoutModal />
                <NotificationToast />
              </div>
            </SmoothScroll>
          </CartProvider>
          </SoundProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
