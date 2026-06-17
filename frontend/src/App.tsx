import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import FilmList from './pages/Film';
import Jadwal from './pages/Jadwal';
import Kursi from './pages/Kursi';
import Checkout from './pages/Checkout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/film" element={<FilmList />} />
        <Route path="/jadwal/:id_film" element={<Jadwal />} />
        <Route path="/kursi/:id_jadwal" element={
          <PrivateRoute><Kursi /></PrivateRoute>
        } />
        <Route path="/checkout/:id_pemesanan" element={
          <PrivateRoute><Checkout /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;