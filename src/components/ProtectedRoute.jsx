import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  // Enquanto estiver a ler o localStorage, não redireciona
  if (loading) {
    return null; // Ou um spinner de carregamento
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}