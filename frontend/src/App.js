import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import HomeDashboardPage from "@/pages/HomeDashboardPage";
import AdminCookiesPage from "@/pages/AdminCookiesPage";
import AdminPage from "@/pages/AdminPage";
import AdminLogsPage from "@/pages/AdminLogsPage";
import FreeCookiesPage from "@/pages/FreeCookiesPage";
import Navbar from "@/components/Navbar";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function MasterRoute({ children }) {
  const { user, loading, isMaster } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isMaster) return <Navigate to="/" replace />;
  return children;
}

function AdminCookiesRoute({ children }) {
  const { user, loading, isMaster, isPremium } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isMaster && !isPremium) return <Navigate to="/" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppLayout() {
  const location = useLocation();
  const showFooter = location.pathname !== "/auth";

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomeDashboardPage /></ProtectedRoute>} />
          <Route path="/checker" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<MasterRoute><AdminPage /></MasterRoute>} />
          <Route path="/admin/logs" element={<MasterRoute><AdminLogsPage /></MasterRoute>} />
          <Route path="/admin/cookies" element={<AdminCookiesRoute><AdminCookiesPage /></AdminCookiesRoute>} />
          <Route path="/free-cookies" element={<ProtectedRoute><FreeCookiesPage /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && (
        <footer className="py-6 text-center border-t border-white/5 bg-[#050505]">
          <p className="text-white/20 text-xs tracking-widest font-mono">
            © Schiro 2026
          </p>
        </footer>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#0A0A0A',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }
        }}
      />
    </AuthProvider>
  );
}

export default App;
