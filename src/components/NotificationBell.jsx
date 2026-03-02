import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCircle2, AlertCircle, FileText, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; // <-- Importamos a sua conexão com o backend

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const dropdownRef = useRef(null);

  // 1. CARREGAR AS NOTIFICAÇÕES REAIS DA API
  async function carregarNotificacoes() {
    try {
      const response = await api.get('/notificacoes');
      // Esperamos que o Laravel devolva a lista de notificações
      setNotificacoes(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Erro ao carregar notificações do sistema", error);
    }
  }

  // Carrega ao iniciar o sistema e a cada 5 minutos (300000ms) para manter atualizado
  useEffect(() => {
    carregarNotificacoes();
    
    const intervalo = setInterval(() => {
      carregarNotificacoes();
    }, 300000);

    return () => clearInterval(intervalo);
  }, []);

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

  // Conta quantas não foram lidas
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  // 2. MARCAR UMA NOTIFICAÇÃO COMO LIDA (Optimistic UI)
  const marcarComoLida = async (id, jaLida) => {
    if (jaLida) return; // Se já foi lida, não faz requisição à toa

    // Atualiza visualmente na mesma hora para parecer instantâneo
    setNotificacoes(notificacoes.map(n => n.id === id ? { ...n, lida: true } : n));
    
    try {
      await api.put(`/notificacoes/${id}/lida`);
    } catch (error) {
      // Se a API falhar, recarrega a lista original para corrigir o visual
      carregarNotificacoes();
      toast.error("Erro ao atualizar o status da notificação.");
    }
  };

  // 3. MARCAR TODAS COMO LIDAS
  const marcarTodasComoLidas = async () => {
    // Atualiza visualmente
    setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
    
    try {
      await api.post('/notificacoes/ler-todas');
      toast.success("Todas as notificações lidas.");
    } catch (error) {
      carregarNotificacoes();
      toast.error("Erro ao limpar notificações.");
    }
  };

  // Escolhe o ícone e a cor com base no tipo de notificação
  const renderIcone = (tipo) => {
    switch(tipo?.toLowerCase()) {
      case 'alerta': return <div className="p-2 bg-red-100 text-red-600 rounded-full"><AlertCircle size={16} /></div>;
      case 'documento': return <div className="p-2 bg-sky-100 text-sky-600 rounded-full"><FileText size={16} /></div>;
      case 'financeiro': return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><DollarSign size={16} /></div>;
      default: return <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><CheckCircle2 size={16} /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BOTÃO DO SINO */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={24} />
        {naoLidas > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* DROPDOWN DE NOTIFICAÇÕES */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">Notificações</h3>
              {naoLidas > 0 && (
                <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {naoLidas} novas
                </span>
              )}
            </div>
            {naoLidas > 0 && (
              <button 
                onClick={marcarTodasComoLidas}
                className="text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors flex items-center gap-1"
              >
                <Check size={14} /> Ler todas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notificacoes.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {notificacoes.map((notificacao) => (
                  <div 
                    key={notificacao.id} 
                    onClick={() => marcarComoLida(notificacao.id, notificacao.lida)}
                    className={`p-4 flex gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${!notificacao.lida ? 'bg-sky-50/30' : 'opacity-70'}`}
                  >
                    <div className="shrink-0 mt-1">
                      {renderIcone(notificacao.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm ${!notificacao.lida ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                          {notificacao.titulo}
                        </h4>
                        {!notificacao.lida && <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-2">
                        {notificacao.mensagem}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                        <Clock size={10} /> {notificacao.tempo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <Bell size={32} className="text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm font-medium">Tudo tranquilo por aqui!</p>
                <p className="text-slate-400 text-xs mt-1">Nenhuma notificação no momento.</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-100 text-center bg-slate-50/50">
            <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
              Ver histórico completo
            </button>
          </div>

        </div>
      )}
    </div>
  );
}