import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 1. IMPORTANTE: Importar o Provedor de Autenticação
import { AuthProvider } from './contexts/AuthContext'; 

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Processos from './pages/Processos';
import Clientes from './pages/Clientes';
import Financeiro from './pages/Financeiro';
import Tarefas from './pages/Tarefas';
import Documentos from './pages/Documentos';
import ClienteDetalhes from './pages/ClienteDetalhes';

// 👇 1. IMPORTAMOS A NOVA PÁGINA AQUI 👇
import Configuracoes from './pages/Configuracoes'; 

// 2. Verifique se o import do Layout e ProtectedRoute está correto
import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <BrowserRouter>
      {/* O AuthProvider deve abraçar TUDO para a Sidebar e as Rotas funcionarem */}
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        
        <Routes>
          {/* Rota Pública */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* 3. ESTRUTURA DE ROTAS PROTEGIDAS */}
          <Route element={<ProtectedRoute />}>
            {/* O Layout é o pai que contém a Sidebar e o <Outlet /> */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/:id" element={<ClienteDetalhes />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/documentos" element={<Documentos />} />
              
              {/* 👇 2. ADICIONAMOS A ROTA DE CONFIGURAÇÕES AQUI 👇 */}
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>

          {/* Redirecionamento para evitar ecrãs em branco em rotas inexistentes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;