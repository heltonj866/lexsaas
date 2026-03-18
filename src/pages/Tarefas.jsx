import { useState, useEffect } from 'react';
import { Plus, Edit, AlertCircle, Clock, Trash2, Loader2, AlertTriangle, User, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; 

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [equipa, setEquipa] = useState([]); // 👇 NOVO: Estado para a lista de utilizadores/equipa
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);

  const [form, setForm] = useState({
    titulo: '', descricao: '', data_vencimento: '', status: 'pendente', prioridade: 'media', processo_id: '', responsavel_id: ''
  });

  const labelEstilo = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block transition-colors";
  const inputEstilo = "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all shadow-sm";

  async function carregarDados() {
    try {
      setLoading(true);
      
      // Busca tarefas e processos
      const [resTarefas, resProcessos] = await Promise.all([
        api.get('/tarefas'), api.get('/processos') 
      ]);
      setTarefas(resTarefas.data.data || resTarefas.data);
      setProcessos(resProcessos.data.data || resProcessos.data);

      // Tenta buscar a equipa para preencher o dropdown (Caso a rota mude, não quebra a tela)
      try {
          const resEquipa = await api.get('/usuarios'); // Ou '/configuracoes/equipe' dependendo da sua API
          setEquipa(resEquipa.data.data || resEquipa.data || []);
      } catch (e) {
          console.warn("Rota de utilizadores não encontrada, usando lista vazia.");
      }

    } catch (error) { toast.error("Erro ao carregar os dados."); } finally { setLoading(false); }
  }

  useEffect(() => { carregarDados(); }, []);

  const handleDragStart = (e, id) => e.dataTransfer.setData('tarefaId', id);
  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = async (e, novoStatus) => {
    const id = e.dataTransfer.getData('tarefaId');
    const tarefa = tarefas.find(t => t.id === Number(id));
    if (tarefa && tarefa.status !== novoStatus) {
      setTarefas(tarefas.map(t => t.id === Number(id) ? { ...t, status: novoStatus } : t));
      try { await api.put(`/tarefas/${id}`, { ...tarefa, status: novoStatus }); } 
      catch (error) { toast.error("Erro ao mover a tarefa."); carregarDados(); }
    }
  };

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      if (idEmEdicao) { await api.put(`/tarefas/${idEmEdicao}`, form); toast.success("Tarefa atualizada!"); } 
      else { await api.post('/tarefas', form); toast.success("Prazo registado!"); }
      fecharModal(); carregarDados();
    } catch (error) { toast.error("Erro ao guardar."); }
  }

  async function confirmarExclusao() {
    if (!tarefaParaExcluir) return;
    try { 
      await api.delete(`/tarefas/${tarefaParaExcluir.id}`); 
      toast.success("Tarefa removida com sucesso!"); 
      setTarefaParaExcluir(null);
      carregarDados(); 
    } catch (error) { toast.error("Erro ao remover a tarefa."); }
  }

  function prepararEdicao(tarefa) {
    setIdEmEdicao(tarefa.id);
    setForm({
      titulo: tarefa.titulo || '', 
      descricao: tarefa.descricao || '',
      data_vencimento: tarefa.data_vencimento ? new Date(tarefa.data_vencimento).toISOString().slice(0, 16) : '',
      status: tarefa.status || 'pendente', 
      prioridade: tarefa.prioridade || 'media', 
      processo_id: tarefa.processo_id || '',
      responsavel_id: tarefa.responsavel_id || ''
    });
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false); setIdEmEdicao(null);
    setForm({ titulo: '', descricao: '', data_vencimento: '', status: 'pendente', prioridade: 'media', processo_id: '', responsavel_id: '' });
  }

  const colunas = [
    { id: 'pendente', titulo: 'A Fazer', cor: 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300' },
    { id: 'em_andamento', titulo: 'Em Andamento', cor: 'border-sky-300 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' },
    { id: 'concluido', titulo: 'Concluído', cor: 'border-emerald-300 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' }
  ];

  const prioridadeCores = {
    baixa: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600', 
    media: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400',
    alta: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400', 
    urgente: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-bold'
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-300 relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Prazos e Tarefas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Gestão ágil da sua rotina jurídica</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 font-bold text-white hover:bg-sky-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto">
          <Plus size={20} /><span>Nova Tarefa</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400"><Loader2 size={32} className="animate-spin text-sky-500" /><p>A carregar quadro...</p></div>
      ) : (
        /* 👇 CORREÇÃO DE LAYOUT: O overflow-hidden e o layout ajustado aqui permitem o Scroll Infinito 👇 */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4 min-h-0">
          {colunas.map(coluna => (
            <div key={coluna.id} className={`flex flex-col rounded-2xl border ${coluna.cor} p-4 sm:p-5 overflow-hidden transition-colors duration-300`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, coluna.id)}>
              <h2 className="font-bold mb-4 flex justify-between items-center text-sm sm:text-base shrink-0">
                {coluna.titulo}
                <span className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs shadow-sm font-bold text-slate-600 dark:text-slate-300">{tarefas.filter(t => t.status === coluna.id).length}</span>
              </h2>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-2">
                {tarefas.filter(t => t.status === coluna.id).map(tarefa => (
                  <div key={tarefa.id} draggable onDragStart={(e) => handleDragStart(e, tarefa.id)} className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-move hover:shadow-md hover:border-slate-300 transition-all group animate-in zoom-in-95">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md ${prioridadeCores[tarefa.prioridade]}`}>{tarefa.prioridade}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => prepararEdicao(tarefa)} className="p-1.5 text-slate-400 hover:text-sky-600 rounded"><Edit size={16} /></button>
                        <button onClick={() => setTarefaParaExcluir(tarefa)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base mb-1.5 line-clamp-2">{tarefa.titulo}</h3>
                    
                    {/* Exibe a descrição se houver */}
                    {tarefa.descricao && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 flex gap-1.5"><AlignLeft size={14} className="shrink-0 mt-0.5" /> {tarefa.descricao}</p>
                    )}

                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {tarefa.processo && <p className="text-[11px] font-bold text-slate-500 uppercase line-clamp-1 break-all">Proc: {tarefa.processo.numero_processo}</p>}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock size={14} className={new Date(tarefa.data_vencimento) < new Date() && tarefa.status !== 'concluido' ? 'text-red-500' : 'text-slate-400'} />
                          <span className={new Date(tarefa.data_vencimento) < new Date() && tarefa.status !== 'concluido' ? 'text-red-500 font-bold' : 'text-slate-500 font-medium'}>
                            {new Date(tarefa.data_vencimento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        
                        {/* Exibe o responsável na base do card */}
                        {tarefa.responsavel && (
                           <div className="flex items-center gap-1.5 text-[10px] bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-bold" title="Responsável">
                               <User size={12} /> {tarefa.responsavel.name?.split(' ')[0]}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO/EDIÇÃO DE TAREFAS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><AlertCircle className="text-sky-600 dark:text-sky-400" /> {idEmEdicao ? 'Editar Prazo/Tarefa' : 'Novo Prazo/Tarefa'}</h2>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 p-5 sm:p-6">
              <form id="form-tar" onSubmit={handleSalvar} className="space-y-5 pb-8 px-1">
                <div>
                  <label className={labelEstilo}>Título da Tarefa</label>
                  <input type="text" required className={inputEstilo} value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Protocolar Petição Inicial" />
                </div>

                {/* 👇 NOVO CAMPO: Descrição 👇 */}
                <div>
                  <label className={labelEstilo}>Descrição / Detalhes</label>
                  <textarea className={`${inputEstilo} min-h-[80px] resize-none`} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Instruções sobre o que deve ser feito..."></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelEstilo}>Data e Hora Fatal</label>
                    <input type="datetime-local" required className={`${inputEstilo} [color-scheme:light_dark]`} value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelEstilo}>Nível de Prioridade</label>
                    <select className={inputEstilo} value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})}>
                      <option value="baixa">Baixa (Rotina)</option><option value="media">Média</option><option value="alta">Alta (Importante)</option><option value="urgente">Urgente (Fatal)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mt-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelEstilo}>Vincular a Processo</label>
                        <select className={inputEstilo} value={form.processo_id} onChange={e => setForm({...form, processo_id: e.target.value})}>
                          <option value="">Nenhum (Tarefa Interna)</option>
                          {processos.map(p => <option key={p.id} value={p.id}>{p.numero_processo}</option>)}
                        </select>
                      </div>
                      
                      {/* 👇 NOVO CAMPO: Responsável 👇 */}
                      <div>
                        <label className={labelEstilo}>Responsável pela Tarefa</label>
                        <select className={inputEstilo} value={form.responsavel_id} onChange={e => setForm({...form, responsavel_id: e.target.value})}>
                          <option value="">Sem responsável definido</option>
                          {equipa.map(membro => <option key={membro.id} value={membro.id}>{membro.name}</option>)}
                        </select>
                      </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="flex justify-end gap-3 p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-2xl shrink-0">
              <button type="button" onClick={fecharModal} className="px-5 py-3 font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all text-sm">Cancelar</button>
              <button type="submit" form="form-tar" className="px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-md transition-all text-sm">Salvar Tarefa</button>
            </div>
          </div>
        </div>
      )}

      {tarefaParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setTarefaParaExcluir(null)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Excluir Tarefa?</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
              Tem a certeza que deseja excluir a tarefa <span className="font-bold text-slate-700 dark:text-slate-300">{tarefaParaExcluir.titulo}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setTarefaParaExcluir(null)} className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                Cancelar
              </button>
              <button type="button" onClick={confirmarExclusao} className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md active:scale-95">
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}