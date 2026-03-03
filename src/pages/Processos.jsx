import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Eye, AlertCircle, Plus, Edit, Scale, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

  // SIMULAÇÃO DE DADOS
  async function carregarDados() {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dadosClientes = [
        { id: 1, nome: 'João Batista Júnior' },
        { id: 2, nome: 'Construtora MG' },
        { id: 3, nome: 'Clínica Veterinária São Francisco' }
      ];

      let dadosProcessos = [
        { id: 1, numero_processo: '0001234-56.2026.8.18.0001', titulo: 'Ação Indenizatória - 2ª Vara Cível', cliente_id: 2, status: 'Ativo', cliente: dadosClientes[1] },
        { id: 2, numero_processo: '0009876-54.2025.8.18.0000', titulo: 'Alvará Judicial - 1ª Vara de Família', cliente_id: 1, status: 'Ativo', cliente: dadosClientes[0] },
        { id: 3, numero_processo: '0005555-33.2024.8.18.0140', titulo: 'Execução Fiscal - Vara da Fazenda', cliente_id: 3, status: 'Suspenso', cliente: dadosClientes[2] }
      ];

      if (busca) dadosProcessos = dadosProcessos.filter(p => p.numero_processo.includes(busca) || p.titulo.toLowerCase().includes(busca.toLowerCase()));
      
      setProcessos(dadosProcessos);
      setClientes(dadosClientes);
    } catch (error) { toast.error("Erro ao carregar dados."); } finally { setLoading(false); }
  }

  useEffect(() => { carregarDados(); }, [busca]);

  async function consultarCNJ() {
    if (!form.numero_processo || form.numero_processo.length < 20) return toast.error("Digite o NPU completo (20 dígitos).");
    setBuscandoCNJ(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); 
      setForm(prev => ({...prev, titulo: 'Ação Cível Restituitória - 3ª Vara de Teresina', status: 'Ativo'}));
      toast.success("Dados importados do DataJud com sucesso!");
    } catch (error) { toast.error("Não foi possível consultar o CNJ."); } finally { setBuscandoCNJ(false); }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      toast.success(idEmEdicao ? "Processo atualizado!" : "Processo registrado!");
      fecharModal();
      carregarDados(); 
    } catch (error) { toast.error("Erro ao salvar processo."); }
  }

  function prepararEdicao(proc) {
    setIdEmEdicao(proc.id);
    setForm({ numero_processo: proc.numero_processo || '', titulo: proc.titulo || '', cliente_id: proc.cliente_id || '', status: proc.status || 'Ativo', descricao: proc.descricao || ''});
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false);
    setIdEmEdicao(null);
    setForm({ numero_processo: '', titulo: '', cliente_id: '', status: 'Ativo', descricao: '' });
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight transition-colors">
            <Briefcase className="text-indigo-600 dark:text-indigo-400" /> Painel de Processos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Gestão centralizada de ações judiciais</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Campo de Busca adaptado */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" placeholder="Buscar NPU ou Título..." 
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-2.5 pl-10 pr-4 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 outline-none transition-all text-sm" 
              value={busca} onChange={e => setBusca(e.target.value)} 
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all text-sm font-bold shadow-sm active:scale-95 whitespace-nowrap">
            <Plus size={18} /> Novo Processo
          </button>
        </div>
      </div>

      {/* TABELA DE PROCESSOS */}
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
                <tr><td colSpan="4" className="py-10 text-center text-slate-500 dark:text-slate-400">A carregar processos...</td></tr>
              ) : processos.length > 0 ? (
                processos.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200 tracking-tight text-sm sm:text-base transition-colors">{proc.numero_processo}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs transition-colors">{proc.titulo}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-sm transition-colors">{proc.cliente?.nome || 'Não vinculado'}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {/* Badges de Status adaptados */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                        proc.status === 'Ativo' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {proc.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right flex justify-end gap-1 sm:gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => prepararEdicao(proc)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors active:scale-95 tooltip" title="Editar Processo"><Edit size={18} /></button>
                      <Link to={`/clientes/${proc.cliente_id}`} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors active:scale-95 tooltip" title="Abrir Ficha do Cliente"><Eye size={18} /></Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle size={40} className="text-slate-300 dark:text-slate-600 mb-3 mx-auto transition-colors" />
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300 transition-colors">Nenhum processo encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE PROCESSO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors">
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 shrink-0 transition-colors">
              <Scale className="text-indigo-600 dark:text-indigo-400"/> {idEmEdicao ? 'Editar Processo' : 'Novo Processo'}
            </h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
              <form id="form-proc" onSubmit={handleSalvar} className="space-y-5">
                
                {/* Área de Consulta do CNJ Destacada */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl transition-colors">
                  <label className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-2 block transition-colors">Número do Processo (NPU)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      required placeholder="Ex: 0000000-00.0000.8.18.0000" 
                      className="flex-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-indigo-200 dark:border-indigo-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm transition-all" 
                      value={form.numero_processo} onChange={e => setForm({...form, numero_processo: e.target.value})} 
                    />
                    {!idEmEdicao && (
                      <button type="button" onClick={consultarCNJ} disabled={buscandoCNJ} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95 w-full sm:w-auto shadow-sm">
                        {buscandoCNJ ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Consultar CNJ
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Título / Ação</label>
                    <input required className="w-full bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Ação de Indenização" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Cliente Vinculado</label>
                    <select required className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                      <option value="">Selecione um cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Status</label>
                    <select required className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="Ativo">Ativo</option><option value="Suspenso">Suspenso</option><option value="Arquivado">Arquivado / Encerrado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Observações Internas (Opcional)</label>
                  <textarea className="w-full bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[80px]" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Anotações sobre o andamento..."></textarea>
                </div>
              </form>
            </div>
            
            {/* Rodapé do Modal */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0 mt-4 transition-colors">
              <button type="button" onClick={fecharModal} className="px-5 py-2.5 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95">Cancelar</button>
              <button type="submit" form="form-proc" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md active:scale-95 transition-all">Salvar Processo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}