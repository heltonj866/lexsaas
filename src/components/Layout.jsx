import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import NotificationBell from './NotificationBell';
import { Menu, Clock, AlertTriangle, X, Zap } from 'lucide-react';
import api from '../services/api';

function TrialBanner() {
  const [billing, setBilling] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/billing/status').then(res => setBilling(res.data)).catch(() => {});
  }, []);

  if (!billing || billing.status !== 'trial' || billing.dias_restantes === null || dismissed) return null;
  const dias = billing.dias_restantes;
  if (dias > 7) return null;

  const isUrgente = dias <= 2;

  return (
    <div className={`relative flex items-center justify-between gap-4 px-5 py-2 text-xs font-semibold shrink-0 transition-all
      ${isUrgente
        ? 'bg-red-500/10 border-b border-red-500/20 text-red-400'
        : 'border-b text-amber-400'}`}
      style={!isUrgente ? { background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' } : {}}>
      <div className="flex items-center gap-2">
        {isUrgente ? <AlertTriangle size={13} className="shrink-0" /> : <Zap size={13} className="shrink-0" />}
        <span>
          {dias === 0 ? 'Teste expira hoje!' : `Teste gratuito: ${dias} dia${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''}.`}
          {' '}
          <button
            onClick={() => navigate('/planos')}
            className="underline underline-offset-2 hover:opacity-75 transition-opacity"
          >
            Assinar agora
          </button>
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="p-0.5 rounded hover:opacity-60 transition-opacity shrink-0">
        <X size={12} />
      </button>
    </div>
  );
}

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: '#07091A', color: '#F1F5F9' }}>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden w-full relative">

        {/* Trial Banner */}
        <TrialBanner />

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 glass-effect">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-1.5 rounded-lg transition-colors text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />
          <NotificationBell />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}