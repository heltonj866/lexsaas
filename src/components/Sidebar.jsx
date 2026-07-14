import { Home, Users, Briefcase, LogOut, DollarSign, CheckSquare, FileText, Settings, X, Scale, MessageSquare, ShieldCheck, Target, ChevronRight } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
      { name: 'Triagem de Leads', path: '/atendimentos', icon: MessageSquare },
    ]
  },
  {
    label: 'Gestão',
    items: [
      { name: 'Clientes', path: '/clientes', icon: Users },
      { name: 'Processos', path: '/processos', icon: Briefcase },
      { name: 'Tarefas', path: '/tarefas', icon: CheckSquare },
      { name: 'Documentos', path: '/documentos', icon: FileText },
      { name: 'Modelos', path: '/modelos', icon: FileText },
    ]
  },
  {
    label: 'Financeiro',
    items: [
      { name: 'Financeiro', path: '/financeiro', icon: DollarSign, permission: 'ver financeiro' },
      { name: 'Métricas de Leads', path: '/relatorios/whatsapp', icon: Target },
    ]
  }
];

const ADMIN_ITEM = { name: 'Super Admin', path: '/superadmin/leads', icon: ShieldCheck };

export function Sidebar({ isOpen, setIsOpen }) {
  const { signOut, user } = useContext(AuthContext);
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const superAdmins = ['heltonj866@gmail.com'];
  const isSuperAdmin = user?.email && superAdmins.includes(user.email);

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const isActive = (path) =>
    location.pathname === path || (location.pathname.startsWith(path) && path !== '/');

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:relative shrink-0 border-r border-white/[0.06]
        ${isOpen ? 'w-64 translate-x-0 shadow-2xl shadow-black/50' : 'w-64 -translate-x-full md:w-[72px] md:translate-x-0'}
      `}
      style={{ background: '#0D1117' }}
    >
      {/* Logo */}
      <div className={`flex h-16 items-center shrink-0 border-b border-white/[0.06] transition-all duration-300 ${isOpen ? 'px-5 gap-3' : 'justify-center px-0'}`}>
        {/* Ícone da balança */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #92400E 0%, #D97706 50%, #F59E0B 100%)', boxShadow: '0 0 16px rgba(245,158,11,0.35)' }}>
            <Scale size={16} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        <div className={`flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          <span className="text-base font-black tracking-tight leading-none" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>
            IU<span style={{ color: '#F59E0B' }}>RIS</span>
          </span>
          <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#475569', letterSpacing: '0.12em' }}>
            Jurídico
          </span>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden ml-auto p-1.5 rounded-lg transition-colors"
          style={{ color: '#475569' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-5 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(item =>
            !item.permission || hasPermission(item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              {/* Label do grupo */}
              <p className={`text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5 transition-all duration-300 px-2
                ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0 h-0 overflow-hidden'}`}
                style={{ color: '#334155' }}>
                {group.label}
              </p>

              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}
                      title={!isOpen ? item.name : ''}
                      className={`flex items-center rounded-lg transition-all duration-150 relative group
                        ${isOpen ? 'px-3 py-2.5 gap-3' : 'justify-center p-2.5'}
                        ${active
                          ? 'text-white'
                          : 'text-slate-400 hover:text-slate-200'
                        }`}
                      style={active ? {
                        background: 'rgba(245,158,11,0.10)',
                        border: '1px solid rgba(245,158,11,0.15)',
                      } : {
                        border: '1px solid transparent',
                      }}
                    >
                      {/* Indicador ativo */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ background: '#F59E0B' }} />
                      )}

                      <Icon
                        size={18}
                        strokeWidth={active ? 2.5 : 2}
                        style={{ color: active ? '#F59E0B' : undefined, flexShrink: 0 }}
                      />

                      <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden
                        ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                        {item.name}
                      </span>

                      {active && isOpen && (
                        <ChevronRight size={14} className="ml-auto opacity-40" style={{ color: '#F59E0B' }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Super Admin */}
        {isSuperAdmin && (
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5 transition-all duration-300 px-2
              ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
              style={{ color: '#7C3AED' }}>
              Administração
            </p>
            <Link
              to={ADMIN_ITEM.path}
              onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}
              className={`flex items-center rounded-lg transition-all duration-150 relative
                ${isOpen ? 'px-3 py-2.5 gap-3' : 'justify-center p-2.5'}
                ${isActive(ADMIN_ITEM.path) ? 'text-white' : 'text-violet-400 hover:text-violet-200'}`}
              style={isActive(ADMIN_ITEM.path) ? {
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.2)',
              } : { border: '1px solid transparent' }}
            >
              <ShieldCheck size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
              <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden
                ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Super Admin
              </span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer: Perfil + Sair */}
      <div className="shrink-0 border-t border-white/[0.06] p-2 space-y-1">
        <Link
          to="/configuracoes"
          onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}
          className={`flex items-center rounded-lg transition-all duration-150 group
            ${isOpen ? 'px-3 py-2.5 gap-3' : 'justify-center p-2.5'}
            ${location.pathname === '/configuracoes'
              ? 'bg-white/[0.05] text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'}`}
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', color: '#fff' }}>
            {user?.avatar
              ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
          </div>

          <div className={`flex-1 transition-all duration-300 overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <p className="text-sm font-semibold truncate" style={{ color: '#E2E8F0' }}>
              {user?.name || 'Utilizador'}
            </p>
            <p className="text-[10px] truncate uppercase tracking-wide font-medium" style={{ color: '#475569' }}>
              Configurações
            </p>
          </div>

          {isOpen && <Settings size={14} className="shrink-0 opacity-30 group-hover:opacity-60 group-hover:rotate-45 transition-all" />}
        </Link>

        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-lg transition-all duration-150 text-sm font-medium group
            ${isOpen ? 'px-3 py-2.5 gap-3 justify-start' : 'p-2.5 justify-center'}
            text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08]`}
        >
          <LogOut size={18} strokeWidth={2} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}