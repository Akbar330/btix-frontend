import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import TicketDetail from './pages/TicketDetail';
import Checkout from './pages/Checkout';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './pages/Scanner';
import Login from './pages/Login';
import Register from './pages/Register';
import PrintTicket from './pages/PrintTicket';
import Receipt from './pages/Receipt';
import Membership from './pages/Membership';
import NotFound from './pages/NotFound';
import Chatbot from './components/Chatbot';

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
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
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
          path="/print/:id"
          element={
            <PrivateRoute>
              <PageTransition><PrintTicket /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <PrivateRoute>
              <PageTransition><Membership /></PageTransition>
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
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <PageTransition><AdminDashboard /></PageTransition>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/scanner"
          element={
            <AdminRoute>
              <PageTransition><Scanner /></PageTransition>
            </AdminRoute>
          }
        />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
          <AnimatedRoutes />
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

