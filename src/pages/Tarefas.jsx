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

  // SIMULAÇÃO DE DADOS
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

  // LÓGICA DE DRAG & DROP
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

  // DEFINIÇÃO DAS CORES DO KANBAN (Claro e Escuro)
  const colunas = [
    { id: 'pendente', titulo: 'A Fazer', cor: 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300' },
    { id: 'em_andamento', titulo: 'Em Andamento', cor: 'border-sky-300 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' },
    { id: 'concluido', titulo: 'Concluído', cor: 'border-emerald-300 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' }
  ];

  const prioridadeCores = {
    baixa: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400', 
    media: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400',
    alta: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400', 
    urgente: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-bold'
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-300">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Prazos e Tarefas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Gestão ágil da sua rotina jurídica</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white hover:bg-sky-700 dark:hover:bg-sky-500 transition-all shadow-sm active:scale-95 w-full sm:w-auto">
          <Plus size={20} /><span>Nova Tarefa</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">A carregar quadro...</div>
      ) : (
        /* QUADRO KANBAN */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden pb-4 lg:pb-0">
          {colunas.map(coluna => (
            <div key={coluna.id} className={`flex flex-col rounded-2xl border ${coluna.cor} p-4 sm:p-5 transition-colors duration-300`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, coluna.id)}>
              
              {/* Cabeçalho da Coluna */}
              <h2 className="font-bold mb-4 flex justify-between items-center text-sm sm:text-base transition-colors">
                {coluna.titulo}
                <span className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs shadow-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
                  {tarefas.filter(t => t.status === coluna.id).length}
                </span>
              </h2>

              {/* Lista de Cartões (Tarefas) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[400px] lg:max-h-none">
                {tarefas.filter(t => t.status === coluna.id).map(tarefa => (
                  <div key={tarefa.id} draggable onDragStart={(e) => handleDragStart(e, tarefa.id)} 
                    className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-move hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500 transition-all group animate-in zoom-in-95"
                  >
                    <div className="flex justify-between items-start mb-3">
                      {/* Badge de Prioridade */}
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors ${prioridadeCores[tarefa.prioridade]}`}>{tarefa.prioridade}</span>
                      
                      {/* Botões de Ação (Aparecem no Hover) */}
                      <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => prepararEdicao(tarefa)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700 rounded transition-colors active:scale-95"><Edit size={16} /></button>
                        <button onClick={() => excluirTarefa(tarefa.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 rounded transition-colors active:scale-95"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base mb-1.5 line-clamp-2 leading-snug transition-colors">{tarefa.titulo}</h3>
                    {tarefa.processo && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1 transition-colors">{tarefa.processo.numero_processo}</p>}
                    
                    {/* Data e Hora de Vencimento */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 transition-colors">
                      <Clock size={14} className={new Date(tarefa.data_vencimento) < new Date() && tarefa.status !== 'concluido' ? 'text-red-500 dark:text-red-400' : ''} />
                      <span className={new Date(tarefa.data_vencimento) < new Date() && tarefa.status !== 'concluido' ? 'text-red-500 dark:text-red-400 font-bold' : 'font-medium'}>
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

      {/* MODAL DE TAREFAS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors">
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 shrink-0 transition-colors">
              <AlertCircle className="text-sky-600 dark:text-sky-400" /> {idEmEdicao ? 'Editar Prazo/Tarefa' : 'Novo Prazo/Tarefa'}
            </h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
              <form id="form-tar" onSubmit={handleSalvar} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Título (Ex: Protocolar Petição Inicial)</label>
                  <input type="text" required className="w-full rounded-xl bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 p-3 outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Vincular a um Processo (Opcional)</label>
                  <select className="w-full rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 p-3 outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm" value={form.processo_id} onChange={e => setForm({...form, processo_id: e.target.value})}>
                    <option value="">Nenhum processo (Tarefa Interna)</option>
                    {processos.map(p => <option key={p.id} value={p.id}>{p.numero_processo}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Data e Hora Fatal</label>
                    {/* O input de data no dark mode adapta-se ao calendário do navegador automaticamente na maioria dos casos, mas o fundo escuro ajuda a integrar */}
                    <input type="datetime-local" required className="w-full rounded-xl bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 p-3 outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm [color-scheme:light_dark]" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Prioridade</label>
                    <select className="w-full rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 p-3 outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm" value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})}>
                      <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente (Fatal)</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0 mt-4 transition-colors">
              <button type="button" onClick={fecharModal} className="px-5 py-2.5 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95">Cancelar</button>
              <button type="submit" form="form-tar" className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 dark:hover:bg-sky-500 shadow-md transition-all active:scale-95">Salvar Tarefa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}