import { useState, useEffect } from 'react';
import { Plus, Edit, DollarSign, Calendar, TrendingUp, TrendingDown, Wallet, Users, Briefcase } from 'lucide-react';
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

  // SIMULAÇÃO DE API
  async function carregarDados() {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dadosClientes = [{ id: 1, nome: 'João Batista Júnior' }, { id: 2, nome: 'Construtora MG' }];
      const dadosProcessos = [{ id: 1, numero_processo: '0001234-56.2026.8.18.0001' }];

      const dadosLancamentos = [
        { id: 1, descricao: 'Honorários Iniciais', valor: 8500.00, tipo: 'receita', data_vencimento: '2026-03-05', status: 'pago', cliente: dadosClientes[1], processo: dadosProcessos[0] },
        { id: 2, descricao: 'Aluguel do Escritório', valor: 2500.00, tipo: 'despesa', data_vencimento: '2026-03-10', status: 'pendente', cliente: null, processo: null },
        { id: 3, descricao: 'Custas Processuais', valor: 450.00, tipo: 'despesa', data_vencimento: '2026-03-02', status: 'pago', cliente: dadosClientes[0], processo: null }
      ];

      setLancamentos(dadosLancamentos);
      setResumo({ receitas: 8500.00, despesas: 2950.00, saldo: 5550.00 });
      setProcessos(dadosProcessos);
      setClientes(dadosClientes);
    } catch (error) { toast.error("Erro ao carregar dados financeiros."); } finally { setLoading(false); }
  }

  useEffect(() => { carregarDados(); }, []);

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const novoLancamento = { ...form, id: Date.now(), valor: parseFloat(form.valor), cliente: form.cliente_id ? clientes.find(c => c.id === Number(form.cliente_id)) : null };
      setLancamentos(prev => [novoLancamento, ...prev]);
      setResumo(prev => ({
        ...prev,
        receitas: form.tipo === 'receita' ? prev.receitas + parseFloat(form.valor) : prev.receitas,
        despesas: form.tipo === 'despesa' ? prev.despesas + parseFloat(form.valor) : prev.despesas,
        saldo: form.tipo === 'receita' ? prev.saldo + parseFloat(form.valor) : prev.saldo - parseFloat(form.valor)
      }));
      toast.success(idEmEdicao ? "Lançamento atualizado!" : "Lançamento registrado!");
      fecharModal();
    } catch (error) { toast.error("Erro ao salvar. Verifique os campos."); }
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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Financeiro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Fluxo de caixa e honorários</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-sm active:scale-95 font-bold w-full sm:w-auto">
          <Plus size={20} /> <span className="sm:inline">Novo Lançamento</span>
        </button>
      </div>

      {/* CARTÕES DE RESUMO (CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in zoom-in-95 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 font-bold text-xs uppercase tracking-wider transition-colors"><TrendingUp size={16}/> Receitas</div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 transition-colors">{formatarMoeda(resumo.receitas)}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in zoom-in-95 delay-75 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2 font-bold text-xs uppercase tracking-wider transition-colors"><TrendingDown size={16}/> Despesas</div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 transition-colors">{formatarMoeda(resumo.despesas)}</p>
        </div>
        
        {/* Cartão de Saldo Dinâmico (Verde se positivo, Vermelho se negativo) adaptado para Dark Mode */}
        <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm animate-in zoom-in-95 delay-150 hover:shadow-md transition-all ${
          resumo.saldo >= 0 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' 
            : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50'
        }`}>
          <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider transition-colors ${
            resumo.saldo >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
          }`}><Wallet size={16}/> Saldo Total</div>
          <p className={`text-2xl sm:text-3xl font-black transition-colors ${
            resumo.saldo >= 0 ? 'text-slate-900 dark:text-emerald-50' : 'text-slate-900 dark:text-rose-50'
          }`}>{formatarMoeda(resumo.saldo)}</p>
        </div>
      </div>

      {/* TABELA DE LANÇAMENTOS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 flex flex-col transition-colors duration-300">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] sm:text-xs font-bold tracking-wider transition-colors">
              <tr>
                <th className="px-4 sm:px-6 py-4">Descrição / Vínculo</th>
                <th className="px-4 sm:px-6 py-4">Tipo</th>
                <th className="px-4 sm:px-6 py-4">Valor</th>
                <th className="px-4 sm:px-6 py-4">Vencimento</th>
                <th className="px-4 sm:px-6 py-4">Status</th>
                <th className="px-4 sm:px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr><td colSpan="6" className="py-10 text-center text-slate-400 dark:text-slate-500">A carregar dados financeiros...</td></tr>
              ) : lancamentos.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in group">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base transition-colors">{l.descricao}</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">
                      {l.processo?.numero_processo ? <><Briefcase size={12}/> {l.processo.numero_processo}</> : <><Users size={12}/> {l.cliente?.nome || 'Geral'}</>}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                      l.tipo === 'receita' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                    }`}>{l.tipo}</span>
                  </td>
                  <td className={`px-4 sm:px-6 py-3 sm:py-4 font-bold text-sm sm:text-base transition-colors ${
                    l.tipo === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {l.tipo === 'despesa' && '-'} {formatarMoeda(l.valor)}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 dark:text-slate-400 font-medium transition-colors">{new Date(l.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                      l.status === 'pago' ? 'bg-emerald-500 text-white shadow-sm dark:bg-emerald-600' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                    }`}>{l.status}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => prepararEdicao(l)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors active:scale-95"><Edit size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE NOVO/EDITAR LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors">
            
            {/* Cabeçalho do Modal */}
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 shrink-0 transition-colors">
              <DollarSign className="text-indigo-600 dark:text-indigo-400"/> {idEmEdicao ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            
            {/* Corpo do Formulário */}
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
              <form id="form-fin" onSubmit={handleSalvar} className="space-y-5">
                
                {/* Botões de Alternância (Receita / Despesa) */}
                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors">
                  <button type="button" onClick={() => setForm({...form, tipo: 'receita'})} 
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                      form.tipo === 'receita' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}>RECEITA</button>
                  <button type="button" onClick={() => setForm({...form, tipo: 'despesa'})} 
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                      form.tipo === 'despesa' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/50 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}>DESPESA</button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Descrição</label>
                  <input required className="w-full bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Ex: Honorários, Aluguel, Custas..." />
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Valor (R$)</label>
                    <input type="number" step="0.01" required className="w-full bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Vencimento</label>
                    <input type="date" required className="w-full bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Cliente</label>
                    <select className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                      <option value="">Geral / Outros</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Processo</label>
                    <select className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={form.processo_id} onChange={e => setForm({...form, processo_id: e.target.value})}>
                      <option value="">Sem processo</option>
                      {processos.map(p => <option key={p.id} value={p.id}>{p.numero_processo}</option>)}
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Rodapé do Modal (Botões) */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0 mt-4 transition-colors">
              <button type="button" onClick={fecharModal} className="px-5 py-2.5 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition-colors active:scale-95">Cancelar</button>
              <button type="submit" form="form-fin" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md transition-all active:scale-95">Salvar Lançamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}