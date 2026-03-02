import { Home, Users, Briefcase, LogOut, DollarSign, CheckSquare, FileText, Settings, X, Scale } from 'lucide-react'; 
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 

export function Sidebar({ isOpen, setIsOpen }) {
  const { signOut, user } = useContext(AuthContext); 
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Processos', path: '/processos', icon: Briefcase },
    { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
    { name: 'Tarefas', path: '/tarefas', icon: CheckSquare },
    { name: 'Cofre', path: '/documentos', icon: FileText },
  ];

  async function handleLogout() {
    await signOut();       
    navigate('/login');    
  }

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative shrink-0 ${
        isOpen ? 'w-64 translate-x-0 shadow-2xl shadow-slate-900/50' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
      }`}
    >
      {/* CABEÇALHO */}
      <div className={`flex h-16 items-center border-b border-slate-800 shrink-0 bg-slate-950/50 transition-all duration-300 ${isOpen ? 'justify-between px-6' : 'justify-center px-0'}`}>
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-600/30 shrink-0">
            <Scale size={20} className="text-white" />
          </div>
          <h1 className={`text-xl font-bold tracking-tight text-white transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            Lex<span className="text-indigo-400">SaaS</span>
          </h1>
        </div>
        
        {/* Botão de Fechar (Apenas no Telemóvel) */}
        <button 
          onClick={() => setIsOpen(false)} 
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors active:scale-95 shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* LINKS DO MENU */}
      <nav className="flex-1 space-y-2 p-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/'); 
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}
              title={!isOpen ? item.name : ""}
              className={`flex items-center rounded-xl p-3 transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-indigo-600/15 text-indigo-400 font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium'
              } ${isOpen ? 'justify-start' : 'justify-center'}`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
              )}
              
              <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-indigo-400'}`}>
                <Icon size={22} />
              </div>
              <span className={`tracking-wide text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 ml-3 w-auto' : 'opacity-0 ml-0 w-0'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* RODAPÉ DO MENU */}
      <div className="border-t border-slate-800/50 p-3 space-y-2 overflow-hidden">
        <Link 
          to="/configuracoes"
          onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}
          title={!isOpen ? "Configurações" : ""}
          className={`group flex items-center rounded-xl p-2 transition-all duration-300 ${
            location.pathname === '/configuracoes' ? 'bg-indigo-600/15 text-indigo-400 font-bold' : 'hover:bg-slate-800/50'
          } ${isOpen ? 'justify-start gap-3' : 'justify-center'}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-bold text-white uppercase shadow-md overflow-hidden">
            {user?.avatar ? (
              <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')}/storage/${user.avatar}`} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          
          <div className={`flex-1 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <p className="truncate text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{user?.name || 'Usuário'}</p>
            <p className="truncate text-[10px] uppercase tracking-wider font-semibold text-slate-500 group-hover:text-slate-400 transition-colors">Configurações</p>
          </div>
          {isOpen && <Settings size={16} className={`text-slate-500 transition-all duration-500 shrink-0 ${location.pathname === '/configuracoes' ? 'text-indigo-400 rotate-90' : 'group-hover:text-white group-hover:rotate-90'}`} />}
        </Link>
        
        <button 
          onClick={handleLogout} 
          title={!isOpen ? "Sair" : ""}
          className={`flex w-full items-center text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all duration-300 font-medium group active:scale-95 text-sm
            ${isOpen ? 'px-4 py-3 gap-3 justify-start' : 'p-3 justify-center'}
          `}
        >
          <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            Sair do Sistema
          </span>
        </button>
      </div>
    </aside>
  );
}