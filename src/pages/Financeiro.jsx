import { useState, useEffect } from 'react';
import { Search, Plus, Edit, DollarSign, Calendar, TrendingUp, TrendingDown, Wallet, Users, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [processos, setProcessos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);

  const [form, setForm] = useState({
    descricao: '', valor: '', tipo: 'receita', categoria: 'honorarios', data_vencimento: '', status: 'pendente', processo_id: '', cliente_id: ''
  });

  // 👇 MODO APRESENTAÇÃO: DADOS FINANCEIROS MOCKADOS 👇
  async function carregarDados() {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dadosClientes = [
        { id: 1, nome: 'João Batista Júnior' },
        { id: 2, nome: 'Construtora MG' }
      ];
      
      const dadosProcessos = [
        { id: 1, numero_processo: '0001234-56.2026.8.18.0001' }
      ];

      const dadosLancamentos = [
        { id: 1, descricao: 'Honorários Iniciais', valor: 8500.00, tipo: 'receita', data_vencimento: '2026-03-05', status: 'pago', cliente: dadosClientes[1], processo: dadosProcessos[0] },
        { id: 2, descricao: 'Aluguel do Escritório', valor: 2500.00, tipo: 'despesa', data_vencimento: '2026-03-10', status: 'pendente', cliente: null, processo: null },
        { id: 3, descricao: 'Custas Processuais', valor: 450.00, tipo: 'despesa', data_vencimento: '2026-03-02', status: 'pago', cliente: dadosClientes[0], processo: null }
      ];

      setLancamentos(dadosLancamentos);
      setResumo({ receitas: 8500.00, despesas: 2950.00, saldo: 5550.00 });
      setProcessos(dadosProcessos);
      setClientes(dadosClientes);
    } catch (error) {
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  // 👇 MODO APRESENTAÇÃO: ADICIONA O LANÇAMENTO NA TELA 👇
  async function handleSalvar(e) {
    e.preventDefault();
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const novoLancamento = {
        ...form,
        id: Date.now(),
        valor: parseFloat(form.valor),
        cliente: form.cliente_id ? clientes.find(c => c.id === Number(form.cliente_id)) : null
      };

      setLancamentos(prev => [novoLancamento, ...prev]);
      
      // Atualiza o saldo visualmente
      setResumo(prev => ({
        ...prev,
        receitas: form.tipo === 'receita' ? prev.receitas + parseFloat(form.valor) : prev.receitas,
        despesas: form.tipo === 'despesa' ? prev.despesas + parseFloat(form.valor) : prev.despesas,
        saldo: form.tipo === 'receita' ? prev.saldo + parseFloat(form.valor) : prev.saldo - parseFloat(form.valor)
      }));

      toast.success(idEmEdicao ? "Lançamento atualizado!" : "Lançamento registrado!");
      fecharModal();
    } catch (error) {
      toast.error("Erro ao salvar. Verifique os campos.");
    }
  }

  function prepararEdicao(item) {
    setIdEmEdicao(item.id);
    setForm({
      descricao: item.descricao || '', valor: item.valor || '', tipo: item.tipo || 'receita',
      categoria: item.categoria || 'honorarios', data_vencimento: item.data_vencimento ? item.data_vencimento.split('T')[0] : '',
      status: item.status || 'pendente', processo_id: item.processo_id || '', cliente_id: item.cliente_id || ''
    });
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false);
    setIdEmEdicao(null);
    setForm({ descricao: '', valor: '', tipo: 'receita', categoria: 'honorarios', data_vencimento: '', status: 'pendente', processo_id: '', cliente_id: '' });
  }

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-sm text-slate-500">Fluxo de caixa e honorários</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
          <Plus size={20} /> <span className="font-medium">Novo Lançamento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in zoom-in-95">
          <div className="flex items-center gap-2 text-emerald-600 mb-2 font-bold text-xs uppercase tracking-wider"><TrendingUp size={16}/> Receitas</div>
          <p className="text-2xl font-black text-slate-800">{formatarMoeda(resumo.receitas)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in zoom-in-95 delay-75">
          <div className="flex items-center gap-2 text-rose-600 mb-2 font-bold text-xs uppercase tracking-wider"><TrendingDown size={16}/> Despesas</div>
          <p className="text-2xl font-black text-slate-800">{formatarMoeda(resumo.despesas)}</p>
        </div>
        <div className={`p-5 rounded-2xl border shadow-sm animate-in zoom-in-95 delay-150 ${resumo.saldo >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider ${resumo.saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}><Wallet size={16}/> Saldo Total</div>
          <p className="text-2xl font-black text-slate-900">{formatarMoeda(resumo.saldo)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-slate-600 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Descrição / Vínculo</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="py-10 text-center text-slate-400">Carregando dados financeiros...</td></tr>
            ) : lancamentos.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors animate-in fade-in">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{l.descricao}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    {l.processo?.numero_processo ? <><Briefcase size={10}/> {l.processo.numero_processo}</> : <><Users size={10}/> {l.cliente?.nome || 'Geral'}</>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${l.tipo === 'receita' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{l.tipo}</span>
                </td>
                <td className={`px-6 py-4 font-bold ${l.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {l.tipo === 'despesa' && '-'} {formatarMoeda(l.valor)}
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">{new Date(l.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${l.status === 'pago' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'}`}>{l.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => prepararEdicao(l)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><DollarSign className="text-indigo-600"/> {idEmEdicao ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
            
            <form onSubmit={handleSalvar} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button type="button" onClick={() => setForm({...form, tipo: 'receita'})} className={`py-2 rounded-lg text-xs font-bold transition-all ${form.tipo === 'receita' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>RECEITA</button>
                <button type="button" onClick={() => setForm({...form, tipo: 'despesa'})} className={`py-2 rounded-lg text-xs font-bold transition-all ${form.tipo === 'despesa' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>DESPESA</button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
                <input required className="w-full border-slate-200 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Ex: Honorários, Aluguel, Custas..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Valor (R$)</label>
                  <input type="number" step="0.01" required className="w-full border-slate-200 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Vencimento</label>
                  <input type="date" required className="w-full border-slate-200 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Cliente</label>
                  <select className="w-full border-slate-200 border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                    <option value="">Geral / Outros</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Processo</label>
                  <select className="w-full border-slate-200 border rounded-lg p-2.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500" value={form.processo_id} onChange={e => setForm({...form, processo_id: e.target.value})}>
                    <option value="">Sem processo</option>
                    {processos.map(p => <option key={p.id} value={p.id}>{p.numero_processo}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={fecharModal} className="px-4 py-2 font-bold text-slate-400 hover:text-slate-600">CANCELAR</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">SALVAR LANÇAMENTO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}