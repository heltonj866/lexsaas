import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Eye, ArrowRight, AlertCircle, Plus, Edit, Scale, Loader2 } from 'lucide-react';
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

  // 👇 MODO APRESENTAÇÃO: DADOS MOCKADOS 👇
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

      if (busca) {
        dadosProcessos = dadosProcessos.filter(p => 
          p.numero_processo.includes(busca) || p.titulo.toLowerCase().includes(busca.toLowerCase())
        );
      }
      
      setProcessos(dadosProcessos);
      setClientes(dadosClientes);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarDados(); }, [busca]);

  // 👇 MODO APRESENTAÇÃO: SIMULA BUSCA NO CNJ 👇
  async function consultarCNJ() {
    if (!form.numero_processo || form.numero_processo.length < 20) {
      return toast.error("Digite o NPU completo (20 dígitos) para consultar.");
    }

    setBuscandoCNJ(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simula delay da API do CNJ
      
      setForm(prev => ({
        ...prev,
        titulo: 'Ação Cível Restituitória - 3ª Vara de Teresina', 
        status: 'Ativo'
      }));
      toast.success("Dados importados do DataJud com sucesso!");
    } catch (error) {
      toast.error("Não foi possível consultar o CNJ.");
    } finally {
      setBuscandoCNJ(false);
    }
  }

  // 👇 MODO APRESENTAÇÃO: SIMULA SALVAR 👇
  async function handleSalvar(e) {
    e.preventDefault();
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      toast.success(idEmEdicao ? "Processo atualizado!" : "Processo registrado!");
      fecharModal();
      carregarDados(); // Recarrega os dados falsos para a lista voltar ao normal
    } catch (error) {
      toast.error("Erro ao salvar processo.");
    }
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
    setIsModalOpen(false);
    setIdEmEdicao(null);
    setForm({ numero_processo: '', titulo: '', cliente_id: '', status: 'Ativo', descricao: '' });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="text-indigo-600" /> Painel de Processos
          </h1>
          <p className="text-sm text-slate-500">Gestão centralizada de ações judiciais</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar NPU ou Título..." className="w-full sm:w-72 rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md shadow-indigo-100">
            <Plus size={18} /> Novo Processo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Processo (NPU) e Título</th>
              <th className="px-6 py-4">Cliente Associado</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="py-10 text-center text-slate-500">Carregando painel...</td></tr>
            ) : processos.length > 0 ? (
              processos.map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 tracking-tight">{proc.numero_processo}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{proc.titulo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700">{proc.cliente?.nome || 'Não vinculado'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${proc.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {proc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => prepararEdicao(proc)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors tooltip" title="Editar Processo"><Edit size={18} /></button>
                    <Link to={`/clientes/${proc.cliente_id}`} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors tooltip" title="Abrir Ficha do Cliente"><Eye size={18} /></Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-500">
                  <AlertCircle size={40} className="text-slate-300 mb-3 mx-auto" />
                  <p className="text-base font-medium text-slate-700">Nenhum processo encontrado</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Scale className="text-indigo-600"/> {idEmEdicao ? 'Editar Processo' : 'Novo Processo'}
            </h2>
            <form onSubmit={handleSalvar} className="space-y-5">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <label className="text-xs font-bold text-indigo-800 uppercase mb-2 block">Número do Processo (NPU)</label>
                <div className="flex gap-2">
                  <input required placeholder="Ex: 0000000-00.0000.8.18.0000" className="flex-1 border border-indigo-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" value={form.numero_processo} onChange={e => setForm({...form, numero_processo: e.target.value})} />
                  {!idEmEdicao && (
                    <button type="button" onClick={consultarCNJ} disabled={buscandoCNJ} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50">
                      {buscandoCNJ ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Consultar CNJ
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Título / Ação</label>
                  <input required className="w-full border-slate-200 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Ação de Indenização" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Cliente Vinculado</label>
                  <select required className="w-full border-slate-200 border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select required className="w-full border-slate-200 border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Ativo">Ativo</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Arquivado">Arquivado / Encerrado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Observações Internas (Opcional)</label>
                <textarea className="w-full border-slate-200 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Anotações sobre o andamento..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={fecharModal} className="px-4 py-2 font-bold text-slate-400 hover:text-slate-600">CANCELAR</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100">SALVAR PROCESSO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}