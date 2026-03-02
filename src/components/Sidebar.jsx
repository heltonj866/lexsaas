import { Home, Users, Briefcase, LogOut, DollarSign, CheckSquare, FileText, Settings } from 'lucide-react'; 
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 

export function Sidebar() {
  const { signOut, user } = useContext(AuthContext); 
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Processos', path: '/processos', icon: Briefcase },
    { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
    { name: 'Prazos/Tarefas', path: '/tarefas', icon: CheckSquare },
    { name: 'Documentos', path: '/documentos', icon: FileText },
  ];

  async function handleLogout() {
    await signOut();       
    navigate('/login');    
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white shrink-0">
      <div className="flex h-20 items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold text-sky-400">Lex<span className="text-indigo-500">SaaS</span></h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/'); 
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* RODAPÉ DO MENU */}
      <div className="border-t border-slate-800 p-4 space-y-2">
        <Link 
          to="/configuracoes"
          className={`group flex w-full items-center gap-3 rounded-lg p-2 transition-colors ${
            location.pathname === '/configuracoes' ? 'bg-slate-800' : 'hover:bg-slate-800/50'
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-bold text-white uppercase shadow-md overflow-hidden">
            {user?.avatar ? (
              <img 
                src={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')}/storage/${user.avatar}`} 
                alt="Avatar" 
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{user?.name || 'Usuário'}</p>
            <p className="truncate text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors">Configurações</p>
          </div>
          <Settings size={16} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
        </Link>
        
        <button 
          onClick={handleLogout} 
          className="flex w-full items-center gap-2 text-rose-500 hover:bg-rose-500/10 p-3 rounded-lg transition-colors font-medium text-sm"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}