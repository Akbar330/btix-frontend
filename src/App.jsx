import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';

import Home from './pages/Home';
import TicketDetail from './pages/TicketDetail';
import Checkout from './pages/Checkout';
import History from './pages/History';
import AdminOverview from './pages/admin/AdminOverview';
import AdminTickets from './pages/admin/AdminTickets';
import AdminVouchers from './pages/admin/AdminVouchers';
import AdminBanners from './pages/admin/AdminBanners';
import AdminPayments from './pages/admin/AdminPayments';
import AdminScanner from './pages/admin/AdminScanner';
import Login from './pages/Login';
import Register from './pages/Register';
import PrintTicket from './pages/PrintTicket';
import Receipt from './pages/Receipt';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  return (user && user.role === 'admin') ? children : <Navigate to="/" />;
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/ticket/:id" element={<PageTransition><TicketDetail /></PageTransition>} />
          <Route
            path="/checkout/:id"
            element={
              <PrivateRoute>
                <PageTransition><Checkout /></PageTransition>
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <PageTransition><History /></PageTransition>
              </PrivateRoute>
            }
          />
          <Route
            path="/receipt/:id"
            element={
              <PrivateRoute>
                <PageTransition><Receipt /></PageTransition>
              </PrivateRoute>
            }
          />
        </Route>

        {/* Standalone Public Routes (No Navbar/Footer) */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route
          path="/print/:id"
          element={
            <PrivateRoute>
              <PageTransition><PrintTicket /></PageTransition>
            </PrivateRoute>
          }
        />

        {/* Admin Routes with AdminLayout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<PageTransition><AdminOverview /></PageTransition>} />
          <Route path="tickets" element={<PageTransition><AdminTickets /></PageTransition>} />
          <Route path="vouchers" element={<PageTransition><AdminVouchers /></PageTransition>} />
          <Route path="banners" element={<PageTransition><AdminBanners /></PageTransition>} />
          <Route path="payments" element={<PageTransition><AdminPayments /></PageTransition>} />
          <Route path="scanner" element={<PageTransition><AdminScanner /></PageTransition>} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

