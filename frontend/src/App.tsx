import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import FilmList from './pages/Film';
import Jadwal from './pages/Jadwal';
import Kursi from './pages/Kursi';
import Checkout from './pages/Checkout';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import AuthProvider from './context/AuthProvider';
import { useAuth } from './context/auth';
import NotFound from './pages/NotFound';

const isAdminUser = (role?: string) => role?.toLowerCase() === 'admin';

const NonAdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  return isAuthenticated && isAdminUser(user?.role)
    ? <Navigate to="/admin" replace />
    : <>{children}</>;
};

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated && isAdminUser(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return isAuthenticated
    ? <>{children}</>
    : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return isAdminUser(user?.role)
    ? <>{children}</>
    : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<NonAdminRoute><Home /></NonAdminRoute>} />
            <Route path="/login" element={<NonAdminRoute><Login /></NonAdminRoute>} />
            <Route path="/register" element={<NonAdminRoute><Register /></NonAdminRoute>} />
            <Route path="/film" element={<NonAdminRoute><FilmList /></NonAdminRoute>} />
            <Route path="/jadwal/:id_film" element={<NonAdminRoute><Jadwal /></NonAdminRoute>} />
            <Route path="/kursi/:id_jadwal" element={<PrivateRoute><Kursi /></PrivateRoute>} />
            <Route path="/checkout/:id_pemesanan" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/tiket-saya" element={<PrivateRoute><MyTickets /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/riwayat-pemesanan" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
