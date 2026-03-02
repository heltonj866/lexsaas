import { useState, useEffect } from 'react';
import { Plus, Edit, AlertCircle, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);

  const [form, setForm] = useState({
    titulo: '', descricao: '', data_vencimento: '', status: 'pendente', prioridade: 'media', processo_id: ''
  });

  async function carregarDados() {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dadosProcessos = [{ id: 1, numero_processo: '0001234-56.2026.8.18.0001', cliente: { nome: 'Construtora MG' } }];
      const dadosTarefas = [
        { id: 1, titulo: 'Redigir Petição Inicial', status: 'pendente', prioridade: 'alta', data_vencimento: '2026-03-02T14:00', processo: dadosProcessos[0] },
        { id: 2, titulo: 'Reunião com Construtora MG', status: 'em_andamento', prioridade: 'media', data_vencimento: '2026-03-05T10:00', processo: null },
        { id: 3, titulo: 'Protocolar Agravo', status: 'concluido', prioridade: 'urgente', data_vencimento: '2026-02-28T18:00', processo: dadosProcessos[0] }
      ];

      setTarefas(dadosTarefas);
      setProcessos(dadosProcessos);
    } catch (error) { toast.error("Erro ao carregar dados."); } finally { setLoading(false); }
  }

  useEffect(() => { carregarDados(); }, []);

  const handleDragStart = (e, id) => e.dataTransfer.setData('tarefaId', id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, novoStatus) => {
    const id = e.dataTransfer.getData('tarefaId');
    const tarefa = tarefas.find(t => t.id === Number(id));
    if (tarefa && tarefa.status !== novoStatus) {
      setTarefas(tarefas.map(t => t.id === Number(id) ? { ...t, status: novoStatus } : t));
    }
  };

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const novaTarefa = { ...form, id: Date.now(), processo: form.processo_id ? processos.find(p => p.id === Number(form.processo_id)) : null };

      if (idEmEdicao) {
        setTarefas(prev => prev.map(t => t.id === idEmEdicao ? { ...novaTarefa, id: idEmEdicao } : t));
        toast.success("Tarefa atualizada!");
      } else {
        setTarefas(prev => [...prev, novaTarefa]);
        toast.success("Tarefa criada com sucesso!");
      }
      fecharModal();
    } catch (error) { toast.error("Erro ao salvar tarefa."); }
  }

  function excluirTarefa(id) {
    if (window.confirm("Tem certeza que deseja apagar esta tarefa?")) {
      setTarefas(prev => prev.filter(t => t.id !== id));
      toast.success("Tarefa removida!");
    }
  }

  function prepararEdicao(tarefa) {
    setIdEmEdicao(tarefa.id);
    setForm({
      titulo: tarefa.titulo || '', descricao: tarefa.descricao || '',
      data_vencimento: tarefa.data_vencimento ? tarefa.data_vencimento.slice(0, 16) : '',
      status: tarefa.status || 'pendente', prioridade: tarefa.prioridade || 'media',
      processo_id: tarefa.processo_id || ''
    });
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false);
    setIdEmEdicao(null);
    setForm({ titulo: '', descricao: '', data_vencimento: '', status: 'pendente', prioridade: 'media', processo_id: '' });
  }

  const colunas = [
    { id: 'pendente', titulo: 'A Fazer', cor: 'border-slate-300 bg-slate-100' },
    { id: 'em_andamento', titulo: 'Em Andamento', cor: 'border-sky-300 bg-sky-50' },
    { id: 'concluido', titulo: 'Concluído', cor: 'border-emerald-300 bg-emerald-50' }
  ];

  const prioridadeCores = {
    baixa: 'bg-slate-100 text-slate-600', media: 'bg-sky-100 text-sky-700',
    alta: 'bg-amber-100 text-amber-700', urgente: 'bg-red-100 text-red-700 font-bold'
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Prazos e Tarefas</h1>
          <p className="text-sm text-slate-500">Gestão ágil da sua rotina jurídica</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white hover:bg-sky-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto">
          <Plus size={20} /><span>Nova Tarefa</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">A carregar quadro...</div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden pb-4 lg:pb-0">
          {colunas.map(coluna => (
            <div key={coluna.id} className={`flex flex-col rounded-2xl border ${coluna.cor} p-4 sm:p-5`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, coluna.id)}>
              <h2 className="font-bold text-slate-700 mb-4 flex justify-between items-center text-sm sm:text-base">
                {coluna.titulo}
                <span className="bg-white px-2.5 py-1 rounded-full text-xs shadow-sm font-bold text-slate-600">{tarefas.filter(t => t.status === coluna.id).length}</span>
              </h2>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[400px] lg:max-h-none">
                {tarefas.filter(t => t.status === coluna.id).map(tarefa => (
                  <div key={tarefa.id} draggable onDragStart={(e) => handleDragStart(e, tarefa.id)} className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 cursor-move hover:shadow-md hover:border-slate-300 transition-all group animate-in zoom-in-95">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md ${prioridadeCores[tarefa.prioridade]}`}>{tarefa.prioridade}</span>
                      <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => prepararEdicao(tarefa)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors active:scale-95"><Edit size={16} /></button>
                        <button onClick={() => excluirTarefa(tarefa.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors active:scale-95"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1.5 line-clamp-2 leading-snug">{tarefa.titulo}</h3>
                    {tarefa.processo && <p className="text-xs text-slate-500 mb-3 line-clamp-1">{tarefa.processo.numero_processo}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                      <Clock size={14} className={new Date(tarefa.data_vencimento) < new Date() && tarefa.status !== 'concluido' ? 'text-red-500' : ''} />
                      <span className={new Date(tarefa.data_vencimento) < new Date() && tarefa.status !== 'concluido' ? 'text-red-500 font-bold' : 'font-medium'}>
                        {new Date(tarefa.data_vencimento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 shrink-0"><AlertCircle className="text-sky-600" /> {idEmEdicao ? 'Editar Prazo/Tarefa' : 'Novo Prazo/Tarefa'}</h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
              <form id="form-tar" onSubmit={handleSalvar} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título (Ex: Protocolar Petição Inicial)</label>
                  <input type="text" required className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-sky-500 transition-shadow text-sm" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vincular a um Processo (Opcional)</label>
                  <select className="w-full rounded-xl border border-slate-300 p-3 bg-white outline-none focus:ring-2 focus:ring-sky-500 transition-shadow text-sm" value={form.processo_id} onChange={e => setForm({...form, processo_id: e.target.value})}>
                    <option value="">Nenhum processo (Tarefa Interna)</option>
                    {processos.map(p => <option key={p.id} value={p.id}>{p.numero_processo}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data e Hora Fatal</label>
                    <input type="datetime-local" required className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-sky-500 transition-shadow text-sm" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Prioridade</label>
                    <select className="w-full rounded-xl border border-slate-300 p-3 bg-white outline-none focus:ring-2 focus:ring-sky-500 transition-shadow text-sm" value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})}>
                      <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente (Fatal)</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 mt-4">
              <button type="button" onClick={fecharModal} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors active:scale-95">Cancelar</button>
              <button type="submit" form="form-tar" className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-md transition-all active:scale-95">Salvar Tarefa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}