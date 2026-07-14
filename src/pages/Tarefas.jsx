import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, AlertTriangle, X, Clock, User, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const LABEL = 'text-[10px] font-bold uppercase tracking-widest block mb-1.5';
const getInputStyle = () => ({
  background: '#07091A',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#E2E8F0',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
});

const PRIORITY = {
  urgente: { label: 'Urgente', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)' },
  alta:    { label: 'Alta',    color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)' },
  media:   { label: 'Média',   color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.20)' },
  baixa:   { label: 'Baixa',   color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.20)' },
};

const COLUMNS = [
  { id: 'pendente',     label: 'Pendente',      color: '#F59E0B', dot: '#F59E0B' },
  { id: 'em_andamento', label: 'Em Andamento',  color: '#3B82F6', dot: '#3B82F6' },
  { id: 'concluido',   label: 'Concluído',     color: '#10B981', dot: '#10B981' },
];

function FormField({ label, children }) {
  return (
    <div>
      <label className={LABEL} style={{ color: '#475569' }}>{label}</label>
      {children}
    </div>
  );
}

function TarefaCard({ tarefa, onEdit, onDelete, onDragStart }) {
  const p = PRIORITY[tarefa.prioridade] || PRIORITY.media;
  const vencimento = new Date(tarefa.data_vencimento);
  const hoje = new Date();
  const atrasada = vencimento < hoje && tarefa.status !== 'concluido';

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, tarefa.id)}
      className="p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all group relative"
      style={{
        background: '#141B2D',
        border: `1px solid ${atrasada ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: atrasada ? '0 0 0 1px rgba(239,68,68,0.1) inset' : 'none',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = atrasada ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = atrasada ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}
    >
      {/* Priority badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
          style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
          {p.label}
        </span>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(tarefa)} className="p-1 rounded transition-colors"
            style={{ color: '#334155' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'transparent'; }}>
            <Edit size={11} />
          </button>
          <button onClick={() => onDelete(tarefa)} className="p-1 rounded transition-colors"
            style={{ color: '#334155' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'transparent'; }}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <p className="text-xs font-semibold leading-snug mb-2" style={{ color: '#CBD5E1' }}>{tarefa.titulo}</p>

      {tarefa.processo && (
        <p className="text-[10px] mb-1.5 truncate" style={{ color: '#334155' }}>
          📁 {tarefa.processo.numero_processo || tarefa.processo.titulo}
        </p>
      )}

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1" style={{ color: atrasada ? '#FCA5A5' : '#475569' }}>
          <Clock size={10} />
          <span className="text-[10px] font-medium">
            {vencimento.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
          {atrasada && <span className="text-[9px] font-bold" style={{ color: '#EF4444' }}>ATRASADA</span>}
        </div>
        {tarefa.responsavel && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
            title={tarefa.responsavel.name}
            style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}>
            {tarefa.responsavel.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [equipa, setEquipa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const formVazio = { titulo: '', descricao: '', data_vencimento: '', status: 'pendente', prioridade: 'media', processo_id: '', responsavel_id: '' };
  const [form, setForm] = useState(formVazio);

  async function carregarDados() {
    try {
      setLoading(true);
      const [rT, rP] = await Promise.all([ api.get('/tarefas'), api.get('/processos') ]);
      setTarefas(rT.data.data || rT.data);
      setProcessos(rP.data.data || rP.data);
      try {
        const rE = await api.get('/usuarios');
        setEquipa(rE.data.data || rE.data || []);
      } catch {
        // Silently ignore
      }
    } catch { toast.error('Erro ao carregar dados.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregarDados(); }, []);

  const handleDragStart = (e, id) => e.dataTransfer.setData('tarefaId', String(id));
  const handleDragOver = e => { e.preventDefault(); };

  const handleDrop = async (e, novoStatus) => {
    setDragOverCol(null);
    const id = Number(e.dataTransfer.getData('tarefaId'));
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa && tarefa.status !== novoStatus) {
      setTarefas(tarefas.map(t => t.id === id ? { ...t, status: novoStatus } : t));
      try { await api.put(`/tarefas/${id}`, { ...tarefa, status: novoStatus }); }
      catch { toast.error('Erro ao mover tarefa.'); carregarDados(); }
    }
  };

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      if (idEmEdicao) { await api.put(`/tarefas/${idEmEdicao}`, form); toast.success('Tarefa atualizada!'); }
      else { await api.post('/tarefas', form); toast.success('Prazo registado!'); }
      fecharModal(); carregarDados();
    } catch { toast.error('Erro ao guardar.'); }
  }

  async function confirmarExclusao() {
    if (!tarefaParaExcluir) return;
    try {
      await api.delete(`/tarefas/${tarefaParaExcluir.id}`);
      toast.success('Tarefa removida!'); setTarefaParaExcluir(null); carregarDados();
    } catch { toast.error('Erro ao remover.'); }
  }

  function prepararEdicao(t) {
    setIdEmEdicao(t.id);
    const fmt = t.data_vencimento ? new Date(t.data_vencimento).toISOString().slice(0, 16) : '';
    setForm({ titulo: t.titulo||'', descricao: t.descricao||'', data_vencimento: fmt,
      status: t.status||'pendente', prioridade: t.prioridade||'media',
      processo_id: t.processo_id||'', responsavel_id: t.responsavel_id||'' });
    setIsModalOpen(true);
  }

  function fecharModal() { setIsModalOpen(false); setIdEmEdicao(null); setForm(formVazio); }

  const tarefasPor = status => tarefas.filter(t => t.status === status);

  return (
    <div className="space-y-5 animate-enter pb-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>Tarefas e Prazos</h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{tarefas.length} tarefa{tarefas.length !== 1 ? 's' : ''} no total</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> <span className="hidden sm:inline">Nova Tarefa</span>
        </button>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: '#F59E0B' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const items = tarefasPor(col.id);
            const isOver = dragOverCol === col.id;
            return (
              <div
                key={col.id}
                onDragOver={e => { handleDragOver(e); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => handleDrop(e, col.id)}
                className="flex flex-col rounded-2xl transition-all"
                style={{
                  background: isOver ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isOver ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  minHeight: '400px',
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.dot, boxShadow: `0 0 6px ${col.dot}60` }} />
                    <span className="text-xs font-bold" style={{ color: '#CBD5E1' }}>{col.label}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto group">
                  {items.length > 0 ? items.map(t => (
                    <TarefaCard
                      key={t.id}
                      tarefa={t}
                      onEdit={prepararEdicao}
                      onDelete={setTarefaParaExcluir}
                      onDragStart={handleDragStart}
                    />
                  )) : (
                    <div className="flex flex-col items-center justify-center py-8 opacity-40">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <ChevronRight size={14} style={{ color: '#334155' }} />
                      </div>
                      <p className="text-xs" style={{ color: '#334155' }}>Arraste tarefas aqui</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative w-full sm:max-w-lg flex flex-col max-h-[92vh] animate-enter"
            style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>

            <div className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold" style={{ color: '#F1F5F9' }}>
                {idEmEdicao ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <button onClick={fecharModal} className="p-1.5 rounded-lg" style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}>
                <X size={15} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              <form id="form-tarefa" onSubmit={handleSalvar} className="space-y-4">
                <FormField label="Título da Tarefa">
                  <input required placeholder="Descreva a tarefa..."
                    style={getInputStyle()} value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Prioridade">
                    <select style={getInputStyle()} value={form.prioridade}
                      onChange={e => setForm({ ...form, prioridade: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <option value="baixa">🟢 Baixa</option>
                      <option value="media">🟣 Média</option>
                      <option value="alta">🟡 Alta</option>
                      <option value="urgente">🔴 Urgente</option>
                    </select>
                  </FormField>
                  <FormField label="Status">
                    <select style={getInputStyle()} value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Data / Prazo">
                  <input type="datetime-local" required
                    style={{ ...getInputStyle(), colorScheme: 'dark' }}
                    value={form.data_vencimento}
                    onChange={e => setForm({ ...form, data_vencimento: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Processo Vinculado">
                    <select style={getInputStyle()} value={form.processo_id}
                      onChange={e => setForm({ ...form, processo_id: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <option value="">Nenhum</option>
                      {processos.map(p => <option key={p.id} value={p.id}>{p.numero_processo || p.titulo}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Responsável">
                    <select style={getInputStyle()} value={form.responsavel_id}
                      onChange={e => setForm({ ...form, responsavel_id: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <option value="">Nenhum</option>
                      {equipa.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </FormField>
                </div>

                <FormField label="Descrição (Opcional)">
                  <textarea placeholder="Detalhes adicionais..."
                    style={{ ...getInputStyle(), minHeight: '72px', resize: 'none' }}
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </FormField>
              </form>
            </div>

            <div className="px-5 py-4 flex gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={fecharModal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
              <button type="submit" form="form-tarefa" className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary">
                {idEmEdicao ? 'Atualizar' : 'Criar Tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tarefaParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTarefaParaExcluir(null)} />
          <div className="relative rounded-2xl p-6 max-w-sm w-full animate-enter"
            style={{ background: '#131929', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.10)' }}>
              <AlertTriangle size={22} style={{ color: '#EF4444' }} />
            </div>
            <h3 className="text-base font-bold text-center mb-1" style={{ color: '#F1F5F9' }}>Excluir Tarefa?</h3>
            <p className="text-center text-xs mb-6" style={{ color: '#475569' }}>
              <span className="font-semibold" style={{ color: '#CBD5E1' }}>{tarefaParaExcluir.titulo}</span> será removida.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setTarefaParaExcluir(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
              <button onClick={confirmarExclusao} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-danger">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}