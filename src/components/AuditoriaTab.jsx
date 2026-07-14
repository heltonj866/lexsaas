import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Loader2, Search, Eye, ChevronLeft, ChevronRight, Monitor, Clock, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AuditoriaTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [detalhesLog, setDetalhesLog] = useState(null);

  async function carregarLogs(page = 1) {
    try {
      setLoading(true);
      const res = await api.get(`/auditoria?page=${page}`);
      setLogs(res.data.data);
      setPaginaAtual(res.data.current_page);
      setUltimaPagina(res.data.last_page);
    } catch {
      toast.error('Erro ao carregar logs de auditoria.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarLogs(1);
  }, []);

  const getActionColor = (action) => {
    switch(action) {
      case 'created': return { bg: 'rgba(16,185,129,0.15)', text: '#10B981', label: 'Criação' };
      case 'updated': return { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6', label: 'Edição' };
      case 'deleted': return { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', label: 'Eliminação' };
      default: return { bg: 'rgba(255,255,255,0.1)', text: '#CBD5E1', label: action };
    }
  };

  const renderJson = (data) => {
    if (!data) return <p className="text-xs text-slate-500 italic">Sem dados adicionais</p>;
    return (
      <pre className="text-[11px] bg-black/30 p-4 rounded-xl overflow-x-auto text-slate-300 border border-white/5 whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl animate-enter">
      <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#F1F5F9' }}>
          <Activity size={24} style={{ color: '#10B981' }} /> Auditoria e Segurança (LGPD)
        </h2>
        <p className="text-xs mt-1" style={{ color: '#64748B' }}>Registro inalterável de todas as atividades realizadas no sistema pelos utilizadores.</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5">Data / Hora</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5">Utilizador</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5">Ação</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5">Entidade</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5">Endereço IP</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-amber-500 mb-2" />
                    <p className="text-xs text-slate-400">A carregar logs cifrados...</p>
                  </td>
                </tr>
              ) : logs.length > 0 ? logs.map(log => {
                const actionStyle = getActionColor(log.action);
                return (
                  <tr key={log.id} className="group transition-colors hover:bg-white/[0.02] border-b border-white/[0.04]">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock size={12} className="text-slate-500" />
                        {new Date(log.created_at).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-200 text-xs">
                        {log.user ? log.user.name : 'Sistema'}
                      </div>
                      <div className="text-[10px] text-slate-500">{log.user ? log.user.email : ''}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: actionStyle.bg, color: actionStyle.text }}>
                        {actionStyle.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 text-xs">
                      {log.auditable_type_readable} <span className="text-slate-500">#{log.auditable_id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                        <Monitor size={12} />
                        {log.ip_address || 'N/D'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button type="button" onClick={() => setDetalhesLog(log)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                        title="Ver payload">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400 text-sm">
                    Nenhum registo de auditoria encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
          <p className="text-xs text-slate-400">
            Página <span className="font-bold text-slate-300">{paginaAtual}</span> de <span className="font-bold text-slate-300">{ultimaPagina}</span>
          </p>
          <div className="flex gap-1.5">
            <button type="button" onClick={() => carregarLogs(paginaAtual - 1)} disabled={paginaAtual === 1}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 disabled:opacity-30 hover:bg-white/10 transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button type="button" onClick={() => carregarLogs(paginaAtual + 1)} disabled={paginaAtual === ultimaPagina}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 disabled:opacity-30 hover:bg-white/10 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {detalhesLog && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDetalhesLog(null)} />
          <div className="relative rounded-2xl p-6 w-full max-w-2xl bg-[#0D1117] border border-white/10 shadow-2xl flex flex-col max-h-[85vh] animate-enter">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5 shrink-0">
              <div>
                <h3 className="font-bold text-slate-200">Detalhes da Ação</h3>
                <p className="text-xs text-slate-500 mt-1">Registo ID #{detalhesLog.id}</p>
              </div>
              <button type="button" onClick={() => setDetalhesLog(null)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg">
                <X size={16} />
              </button>
            </div>
            
            <div className="overflow-y-auto space-y-5 pr-2 custom-scrollbar flex-1">
              <div className="flex flex-col gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Contexto</p>
                    <p className="text-sm text-slate-200">{detalhesLog.auditable_type_readable} <span className="text-slate-400">#{detalhesLog.auditable_id}</span></p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Endereço IP</p>
                    <p className="text-sm text-slate-200 font-mono">{detalhesLog.ip_address}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">User Agent (Dispositivo)</p>
                  <p className="text-xs text-slate-400 font-mono break-all bg-black/20 p-2 rounded-lg border border-white/5 mt-1">{detalhesLog.user_agent}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-500 mb-2 uppercase tracking-wider">Valores Antigos (Antes da Ação)</h4>
                {renderJson(detalhesLog.old_values)}
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-emerald-500 mb-2 uppercase tracking-wider">Novos Valores (Depois da Ação)</h4>
                {renderJson(detalhesLog.new_values)}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
