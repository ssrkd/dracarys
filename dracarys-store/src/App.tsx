import { lazy, Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { NativeBiometric } from 'capacitor-native-biometric';
import { ShieldCheck } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { Toast } from './components/ui/Toast';
import { useToastStore } from './store/toastStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ScrollToTop } from './components/ScrollToTop';

import { Home } from './pages/Home';
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const AdminAuth = lazy(() => import('./pages/AdminAuth').then(m => ({ default: m.AdminAuth })));

// Info Pages
const Help = lazy(() => import('./pages/info/Help').then(m => ({ default: m.Help })));
const Shipping = lazy(() => import('./pages/info/Shipping').then(m => ({ default: m.Shipping })));
const Returns = lazy(() => import('./pages/info/Returns').then(m => ({ default: m.Returns })));
const Privacy = lazy(() => import('./pages/info/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/info/Terms').then(m => ({ default: m.Terms })));

// Защищенный роут для админки
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('dracarys_admin_token');
  if (!isAuthenticated) {
    return <AdminAuth />;
  }
  return <>{children}</>;
};

// Persistent session tracking with cooldown to prevent loops
let lastSuccessfulAuthTime = 0;
let lastBackgroundTime = 0;

function AppContent() {
  const [isLocked, setIsLocked] = useState(false);
  const { toasts, removeToast } = useToastStore();
  const navigate = useNavigate();

  const authInProgress = useRef(false);

  const authenticate = useCallback(async (isForegroundSearch = false) => {
    if (!Capacitor.isNativePlatform()) return;

    const now = Date.now();

    // 1. Cooldown: Don't prompt again if we authenticated in the last 30 seconds
    if (now - lastSuccessfulAuthTime < 30000) {
      console.log('FaceID: Cooldown active, skipping prompt');
      return;
    }

    // 2. Prevent concurrent prompts
    if (authInProgress.current) {
      return;
    }

    // 3. Grace period check for foreground transitions
    if (isForegroundSearch) {
      const timeInBackground = now - lastBackgroundTime;
      // If we were in background for less than 15 seconds, don't re-auth
      if (timeInBackground < 15000) {
        console.log('FaceID: Grace period active, skipping prompt');
        return;
      }
    }

    try {
      authInProgress.current = true;
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) {
        authInProgress.current = false;
        return;
      }

      setIsLocked(true);
      await NativeBiometric.verifyIdentity({
        reason: "Для доступа к админ-панели",
        title: "Face ID",
        subtitle: "Подтвердите личность",
        description: "Это необходимо для безопасности ваших данных"
      });

      setIsLocked(false);
      lastSuccessfulAuthTime = Date.now();
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      setIsLocked(true);
      lastSuccessfulAuthTime = 0; // Reset on failure
    } finally {
      authInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial check on mount - only if not recently authenticated
    authenticate();

    // Re-auth ONLY when returning from actual background
    const handleStateChange = CapApp.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed, isActive:', isActive);
      if (isActive) {
        // Attempt to authenticate with foreground logic (checks grace period)
        authenticate(true);
      } else {
        // App is going to background
        lastBackgroundTime = Date.now();
      }
    });

    return () => {
      handleStateChange.then(listener => listener.remove());
    };
  }, [authenticate]);

  useEffect(() => {
    // Если запущено как нативное приложение (iPhone/Android)
    if (Capacitor.isNativePlatform()) {
      // И если мы на главной странице
      if (window.location.pathname === '/') {
        navigate('/dracarys-admin');
      }
    }
  }, [navigate]);

  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-dark text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl animate-pulse">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-dark mb-4 tracking-tighter">Dracarys Security</h1>
        <p className="text-gray mb-12 max-w-xs font-medium leading-relaxed">
          Используйте Face ID для подтверждения личности и защиты ваших данных.
        </p>
        <button
          onClick={() => authenticate()}
          className="px-10 py-4 bg-dark text-white rounded-full font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-apple-lg"
        >
          Разблокировать
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/dracarys-gate" element={<AdminAuth />} />
            <Route path="/help" element={<Help />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route
              path="/dracarys-admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            {/* Redirect old admin path */}
            <Route path="/admin" element={<AdminAuth />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Cart />

      {/* Toast Container: mobile bottom-center, desktop top-right */}
      <div className="fixed z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none
                      md:top-4 md:right-4 md:items-end
                      bottom-4 left-1/2 -translate-x-1/2 items-center md:bottom-auto md:left-auto md:translate-x-0">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
