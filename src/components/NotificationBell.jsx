import { useState, useRef, useEffect } from 'react';
import { Bell, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Novo Documento', desc: 'Contrato Social enviado por MG Construtora.', time: 'Há 5 min', icon: FileText, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
    { id: 2, title: 'Prazo Vencendo', desc: 'Petição Inicial - Maria Souza vence hoje.', time: 'Há 2 horas', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    { id: 3, title: 'Processo Atualizado', desc: 'Sentença favorável publicada no Diário.', time: 'Ontem', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ];

  const unreadCount = 2; // Simulação de notificações não lidas

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={22} className={unreadCount > 0 ? "animate-pulse" : ""} />
        
        {/* Bolinha vermelha de notificação */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 transition-colors"></span>
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200 transition-colors">
          
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Notificações</h3>
            <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-full">
              {unreadCount} novas
            </span>
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-4">
                      <div className={`shrink-0 p-2.5 rounded-full h-fit transition-colors ${notif.bg}`}>
                        <Icon size={18} className={notif.color} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5 transition-colors">{notif.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 transition-colors">{notif.desc}</p>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 block uppercase tracking-wider">{notif.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <Bell size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">Nenhuma notificação no momento.</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
            <button className="w-full text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
              Marcar todas como lidas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}