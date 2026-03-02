import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import NotificationBell from './NotificationBell';
import { Menu } from 'lucide-react'; 

export function Layout() {
  // Inteligência: Inicia aberto se for computador (>768px), fechado se for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Ouve mudanças no tamanho da janela para se adaptar automaticamente
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-[100dvh] bg-slate-50 overflow-hidden font-sans">
      
      {/* OVERLAY PARA MOBILE (Fundo escuro/desfocado) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* SIDEBAR COM EFEITO RETRÁTIL */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* LADO DIREITO: Header e Conteúdo */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 shadow-sm">
          
          {/* BOTÃO HAMBURGER (Agora visível em TODAS as telas!) */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors active:scale-95"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1"></div>

          <NotificationBell />
        </header>

        {/* CONTEÚDO DINÂMICO DAS PÁGINAS */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth relative">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}