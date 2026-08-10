import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SoundProvider } from './context/SoundContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import AuthModal from './components/ui/AuthModal';
import CartDrawer from './components/ui/CartDrawer';
import CheckoutModal from './components/ui/CheckoutModal';
import ProtectedRoute from './components/ProtectedRoute';
import AuroraBackground from './components/ui/AuroraBackground';

// Pages
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import UploadProjectPage from './pages/UploadProjectPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import AiShieldPage from './pages/AiShieldPage';
import AdminPage from './pages/AdminPage';

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
              <div className="flex flex-col min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
                {/* ============================================================ */}
                {/* GLOBAL PERSISTENT 3D CYBER VIDEO & PARTICLE MATRIX LAYER     */}
                {/* ============================================================ */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
                  {/* High-Tech 3D Cyber Animation Video Loop */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen filter saturate-150 contrast-125 scale-105"
                    src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4"
                  />
                  {/* Real-Time Interactive 3D Canvas Synthesizer */}
                  <AuroraBackground theme="cyan" className="opacity-75" />
                  {/* Holographic Ambient Glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/30 via-transparent to-[#030712]/60" />
                </div>

                {/* Top Navigation */}
                <div className="relative z-20">
                  <Navbar />
                </div>

                {/* Main Content Viewport */}
                <main className="flex-1 relative z-10">
                  <Routes>
                    {/* Public Landing Page (Homepage & Custom Build) */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Strictly Protected Routes Requiring Login / Registration */}
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

                    {/* Strictly Protected Routes Requiring Login / Registration */}
                    <Route
                      path="/upload"
                      element={
                        <ProtectedRoute reason="Please log in or register to list and monetize your engineering project.">
                          <UploadProjectPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={<Navigate to="/profile" replace />}
                    />
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
                        <ProtectedRoute reason="Please log in or register to use real-time WhatsApp-style creator messaging.">
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
              </div>
            </CartProvider>
          </SoundProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
