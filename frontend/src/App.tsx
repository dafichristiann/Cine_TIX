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

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
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

  return user?.role?.toLowerCase() === 'admin'
    ? <>{children}</>
    : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/film" element={<FilmList />} />
            <Route path="/jadwal/:id_film" element={<Jadwal />} />
            <Route path="/kursi/:id_jadwal" element={<PrivateRoute><Kursi /></PrivateRoute>} />
            <Route path="/checkout/:id_pemesanan" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/tiket-saya" element={<PrivateRoute><MyTickets /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
