import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Eye, AlertCircle, Plus, Edit, Scale, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; 

export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [buscandoCNJ, setBuscandoCNJ] = useState(false);

  const [form, setForm] = useState({
    numero_processo: '', titulo: '', cliente_id: '', status: 'Ativo', descricao: ''
  });

  // --- ESTILOS PREMIUM PADRONIZADOS ---
  const labelEstilo = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block transition-colors";
  const inputEstilo = "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm";

  async function carregarDados() {
    try {
      setLoading(true);
      const [resProcessos, resClientes] = await Promise.all([
        api.get(`/processos?search=${busca}`),
        api.get('/clientes')
      ]);

      setProcessos(resProcessos.data.data); 
      const clientesData = resClientes.data.data ? resClientes.data.data : resClientes.data;
      setClientes(clientesData);
    } catch (error) { toast.error("Erro ao carregar dados do servidor."); } finally { setLoading(false); }
  }

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => { carregarDados(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [busca]);

  async function consultarCNJ() {
    if (!form.numero_processo || form.numero_processo.length < 15) return toast.error("Digite um NPU válido.");
    const npuLimpo = form.numero_processo.replace(/\D/g, '');
    
    setBuscandoCNJ(true);
    try {
      const response = await api.get(`/processos/cnj/${npuLimpo}`);
      setForm(prev => ({
        ...prev, 
        titulo: `${response.data.classe} - ${response.data.orgao}`, 
        status: 'Ativo'
      }));
      toast.success("Dados importados do DataJud com sucesso!");
    } catch (error) { toast.error("Não foi possível consultar o CNJ. Verifique o NPU."); } finally { setBuscandoCNJ(false); }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      if (idEmEdicao) {
        await api.put(`/processos/${idEmEdicao}`, form);
        toast.success("Processo atualizado com sucesso!");
      } else {
        await api.post('/processos', form);
        toast.success("Processo registrado com sucesso!");
      }
      fecharModal();
      carregarDados(); 
    } catch (error) { toast.error(error.response?.data?.message || "Erro ao salvar processo."); }
  }

  function prepararEdicao(proc) {
    setIdEmEdicao(proc.id);
    setForm({ 
      numero_processo: proc.numero_processo || '', titulo: proc.titulo || '', 
      cliente_id: proc.cliente_id || '', status: proc.status || 'Ativo', descricao: proc.descricao || ''
    });
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false); setIdEmEdicao(null);
    setForm({ numero_processo: '', titulo: '', cliente_id: '', status: 'Ativo', descricao: '' });
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight transition-colors">
            <Briefcase className="text-indigo-600 dark:text-indigo-400" /> Painel de Processos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Gestão centralizada de ações judiciais</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input type="text" placeholder="Buscar NPU ou Título..." className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 py-2.5 pl-10 pr-4 focus:border-indigo-500 focus:ring-2 outline-none transition-all text-sm" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-sm active:scale-95">
            <Plus size={18} /> Novo Processo
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1 transition-colors duration-300">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[650px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] sm:text-xs font-bold tracking-wider transition-colors">
              <tr>
                <th className="px-4 sm:px-6 py-4">Processo (NPU) e Título</th>
                <th className="px-4 sm:px-6 py-4">Cliente Associado</th>
                <th className="px-4 sm:px-6 py-4">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr><td colSpan="4" className="py-12 text-center text-slate-500"><Loader2 size={24} className="animate-spin text-indigo-500 mx-auto mb-3" /><p>A carregar processos...</p></td></tr>
              ) : processos.length > 0 ? (
                processos.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{proc.numero_processo}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{proc.titulo || proc.tipo_acao}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4"><span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{proc.cliente?.nome || 'Não vinculado'}</span></td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${proc.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{proc.status}</span></td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => prepararEdicao(proc)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><Edit size={18} /></button>
                      <Link to={`/processos/${proc.id}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg"><Eye size={18} /></Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="py-12 text-center text-slate-500"><AlertCircle size={40} className="mx-auto mb-3 opacity-50" /><p className="text-base font-medium">Nenhum processo encontrado</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PREMIUM DE PROCESSO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Scale className="text-indigo-600 dark:text-indigo-400"/> {idEmEdicao ? 'Editar Processo' : 'Novo Processo'}</h2>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 p-5 sm:p-6">
              <form id="form-proc" onSubmit={handleSalvar} className="space-y-5 pb-8 px-1">
                
                <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl">
                  <label className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-2 block">Número do Processo (NPU)</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input required placeholder="Ex: 0000000-00.0000.8.18.0000" className={`${inputEstilo} font-mono`} value={form.numero_processo} onChange={e => setForm({...form, numero_processo: e.target.value})} />
                    {!idEmEdicao && (
                      <button type="button" onClick={consultarCNJ} disabled={buscandoCNJ} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50 shrink-0 shadow-sm">
                        {buscandoCNJ ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Consultar CNJ
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
                  <div>
                    <label className={labelEstilo}>Título / Ação</label>
                    <input required className={inputEstilo} value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Ação de Indenização" />
                  </div>
                  <div>
                    <label className={labelEstilo}>Cliente Vinculado</label>
                    <select required className={inputEstilo} value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                      <option value="">Selecione um cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelEstilo}>Status</label>
                    <select required className={inputEstilo} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="Ativo">Ativo</option><option value="Suspenso">Suspenso</option><option value="Arquivado">Arquivado / Encerrado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelEstilo}>Observações Internas (Opcional)</label>
                  <textarea className={`${inputEstilo} min-h-[100px] resize-none`} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Anotações sobre o andamento..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-2xl shrink-0">
              <button type="button" onClick={fecharModal} className="px-5 py-3 font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all text-sm">Cancelar</button>
              <button type="submit" form="form-proc" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all text-sm">Salvar Processo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}