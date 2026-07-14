import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext'; 

import Login from './pages/auth/Login';
import Cadastro from "./pages/auth/Cadastro";
import EsqueciSenha from "./pages/auth/EsqueciSenha";
import RedefinirSenha from "./pages/auth/RedefinirSenha";
import Dashboard from './pages/Dashboard';
import Processos from './pages/Processos';
import Clientes from './pages/Clientes';
import Financeiro from './pages/Financeiro';
import Tarefas from './pages/Tarefas';
import Documentos from './pages/Documentos';
import ClienteDetalhes from './pages/ClienteDetalhes';
import ProcessoDetalhes from './pages/ProcessoDetalhes';
import Configuracoes from './pages/Configuracoes'; 
import Atendimentos from './pages/Atendimentos'; 
import RelatorioWhatsApp from './pages/RelatorioWhatsApp';
import Modelos from './pages/Modelos';
import SuperAdminLeads from './pages/SuperAdminLeads';

import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        
        <Routes>
          {/* ROTAS PÚBLICAS (Sem menu lateral) */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />

          {/* ROTAS PRIVADAS DO SISTEMA (Com menu lateral e margens) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/atendimentos" element={<Atendimentos />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/:id" element={<ClienteDetalhes />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/processos/:id" element={<ProcessoDetalhes />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/modelos" element={<Modelos />} />
              <Route path="/superadmin/leads" element={<SuperAdminLeads />} />
              
              {/* ✅ ROTA CORRIGIDA: Agora o relatório está dentro do Layout! */}
              <Route path="/relatorios/whatsapp" element={<RelatorioWhatsApp />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;