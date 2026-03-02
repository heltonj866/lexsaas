import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import NotificationBell from './NotificationBell'; // <-- Importamos o nosso novo componente

export function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Menu Lateral Esquerdo */}
      <Sidebar />
      
      {/* Lado Direito: Header no topo + Conteúdo em baixo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 👇 O SEU NOVO HEADER AQUI 👇 */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 sm:px-8 shrink-0 z-20 shadow-sm">
          {/* Colocamos o sininho encostado à direita */}
          <NotificationBell />
        </header>

        {/* Conteúdo Dinâmico das Páginas */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 relative">
          <Outlet />
        </main>
        
      </div>
      
    </div>
  );
}