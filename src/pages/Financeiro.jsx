import { useState, useEffect } from 'react';
import { Plus, Edit, DollarSign, TrendingUp, TrendingDown, Wallet, Users, Briefcase, Loader2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [processos, setProcessos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);

  const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState(null);

  const [form, setForm] = useState({
    descricao: '', valor: '', tipo: 'receita', categoria: 'honorarios', data_vencimento: '', status: 'pendente', processo_id: '', cliente_id: ''
  });

  const labelEstilo = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block transition-colors";
  const inputEstilo = "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm";

  async function carregarDados() {
    try {
      setLoading(true);
      const [resLancamentos, resClientes, resProcessos] = await Promise.all([
        api.get('/financeiro'), api.get('/clientes'), api.get('/processos')
      ]);
      setLancamentos(resLancamentos.data.data || []);
      setClientes(resClientes.data.data || resClientes.data);
      setProcessos(resProcessos.data.data || resProcessos.data);
      calcularResumo(resLancamentos.data.data || []);
    } catch (error) { toast.error("Erro ao carregar dados."); } finally { setLoading(false); }
  }

  useEffect(() => { carregarDados(); }, []);

  function calcularResumo(dados) {
    let rec = 0, des = 0;
    dados.forEach(item => {
      const v = parseFloat(item.valor);
      if (item.tipo === 'receita') rec += v;
      if (item.tipo === 'despesa') des += v;
    });
    setResumo({ receitas: rec, despesas: des, saldo: rec - des });
  }

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      if (idEmEdicao) await api.put(`/financeiro/${idEmEdicao}`, form);
      else await api.post('/financeiro', form);
      toast.success("Lançamento salvo!");
      fecharModal();
      carregarDados(); 
    } catch (error) { toast.error("Erro ao salvar."); }
  }

  async function confirmarExclusao() {
    if (!lancamentoParaExcluir) return;
    try { 
        await api.delete(`/financeiro/${lancamentoParaExcluir.id}`); 
        toast.success("Lançamento excluído com sucesso!"); 
        setLancamentoParaExcluir(null); 
        carregarDados(); 
    } catch (error) { 
        toast.error("Erro ao excluir lançamento."); 
    }
  }

  async function alternarStatus(lancamento) {
    const novoStatus = lancamento.status === 'pago' ? 'pendente' : 'pago';
    try { 
        await api.put(`/financeiro/${lancamento.id}`, { ...lancamento, status: novoStatus }); 
        carregarDados(); 
        toast.success(novoStatus === 'pago' ? 'Marcado como concluído!' : 'Marcado como pendente!');
    } catch (error) { toast.error("Erro ao atualizar o status."); }
  }

  function prepararEdicao(item) {
    setIdEmEdicao(item.id);
    setForm({
      descricao: item.descricao || '', valor: item.valor || '', tipo: item.tipo || 'receita', categoria: item.categoria || 'honorarios', 
      data_vencimento: item.data_vencimento ? item.data_vencimento.split('T')[0] : '', status: item.status || 'pendente', 
      processo_id: item.processo_id || '', cliente_id: item.cliente_id || ''
    });
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false); setIdEmEdicao(null);
    setForm({ descricao: '', valor: '', tipo: 'receita', categoria: 'honorarios', data_vencimento: '', status: 'pendente', processo_id: '', cliente_id: '' });
  }

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // Função auxiliar para definir como o botão de status vai aparecer
  const renderStatusButton = (lancamento) => {
    const isReceita = lancamento.tipo === 'receita';
    const isPago = lancamento.status === 'pago';
    
    let texto = '';
    let corClasses = '';

    if (isPago) {
      texto = isReceita ? 'Recebido' : 'Pago';
      corClasses = 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600';
    } else {
      texto = isReceita ? 'A Receber' : 'A Pagar';
      corClasses = 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400';
    }

    return (
      <button 
        onClick={() => alternarStatus(lancamento)} 
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all active:scale-95 whitespace-nowrap ${corClasses}`}
      >
        {texto}
      </button>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Financeiro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fluxo de caixa e honorários</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 transition-all shadow-sm active:scale-95 font-bold">
          <Plus size={20} /> Nova Movimentação
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><div className="flex items-center gap-2 text-emerald-600 mb-2 font-bold text-xs uppercase tracking-wider"><TrendingUp size={16}/> Receitas</div><p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">{formatarMoeda(resumo.receitas)}</p></div>
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><div className="flex items-center gap-2 text-rose-600 mb-2 font-bold text-xs uppercase tracking-wider"><TrendingDown size={16}/> Despesas</div><p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">{formatarMoeda(resumo.despesas)}</p></div>
        <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm ${resumo.saldo >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50'}`}>
          <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider ${resumo.saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}><Wallet size={16}/> Saldo Total</div>
          <p className={`text-2xl sm:text-3xl font-black ${resumo.saldo >= 0 ? 'text-slate-900 dark:text-emerald-50' : 'text-slate-900 dark:text-rose-50'}`}>{formatarMoeda(resumo.saldo)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] sm:text-xs font-bold tracking-wider">
              <tr><th className="px-4 sm:px-6 py-4">Descrição</th><th className="px-4 sm:px-6 py-4">Tipo</th><th className="px-4 sm:px-6 py-4">Valor</th><th className="px-4 sm:px-6 py-4">Vencimento</th><th className="px-4 sm:px-6 py-4">Status</th><th className="px-4 sm:px-6 py-4 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {lancamentos.map((l) => {
                // 👇 LÓGICA DE ALERTA DE VENCIMENTO 👇
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataVenc = new Date(l.data_vencimento);
                const isAtrasado = dataVenc < hoje && l.status === 'pendente';

                return (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                        {isAtrasado && <AlertCircle size={16} className="text-rose-500" title="Conta em atraso!" />}
                        {l.descricao}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                        {l.processo?.numero_processo ? <><Briefcase size={12}/> {l.processo.numero_processo}</> : ''}
                        {!l.processo?.numero_processo && l.cliente?.nome ? <><Users size={12}/> {l.cliente.nome}</> : ''}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${l.tipo === 'receita' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{l.tipo}</span></td>
                    <td className={`px-4 sm:px-6 py-3 sm:py-4 font-bold ${l.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>{l.tipo === 'despesa' && '-'} {formatarMoeda(l.valor)}</td>
                    
                    {/* Data de Vencimento destacada se estiver atrasada */}
                    <td className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-medium ${isAtrasado ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                      {dataVenc.toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                      {isAtrasado && <span className="block text-[10px] text-rose-500 mt-0.5">Vencido</span>}
                    </td>
                    
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {renderStatusButton(l)}
                    </td>
                    
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => prepararEdicao(l)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><Edit size={18} /></button>
                      <button onClick={() => setLancamentoParaExcluir(l)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><DollarSign className="text-indigo-600 dark:text-indigo-400"/> {idEmEdicao ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 p-5 sm:p-6">
              <form id="form-fin" onSubmit={handleSalvar} className="space-y-5 pb-4 px-1">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-2">
                  <button type="button" onClick={() => setForm({...form, tipo: 'receita'})} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${form.tipo === 'receita' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500'}`}>RECEITA</button>
                  <button type="button" onClick={() => setForm({...form, tipo: 'despesa'})} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${form.tipo === 'despesa' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm border border-slate-200/50' : 'text-slate-500'}`}>DESPESA</button>
                </div>
                <div>
                  <label className={labelEstilo}>Descrição do Lançamento</label>
                  <input required className={inputEstilo} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Ex: Honorários Iniciais, Aluguel..." />
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div>
                    <label className={labelEstilo}>Valor (R$)</label>
                    <input type="number" step="0.01" required className={inputEstilo} value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelEstilo}>Data de Vencimento</label>
                    <input type="date" required className={inputEstilo} value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className={labelEstilo}>Vincular Cliente (Opcional)</label>
                      <select className={inputEstilo} value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
                        <option value="">Geral / Despesa do Escritório</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelEstilo}>Vincular Processo (Opcional)</label>
                      <select className={inputEstilo} value={form.processo_id} onChange={e => setForm({...form, processo_id: e.target.value})}>
                        <option value="">Sem processo</option>
                        {processos.map(p => <option key={p.id} value={p.id}>{p.numero_processo}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-3 p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900 rounded-b-2xl">
              <button type="button" onClick={fecharModal} className="px-5 py-3 font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95 text-sm">Cancelar</button>
              <button type="submit" form="form-fin" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 text-sm">Salvar Lançamento</button>
            </div>
          </div>
        </div>
      )}

      {lancamentoParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setLancamentoParaExcluir(null)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Excluir Lançamento?</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
              Tem a certeza que deseja excluir o lançamento de <span className="font-bold text-slate-700 dark:text-slate-300">{formatarMoeda(lancamentoParaExcluir.valor)}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setLancamentoParaExcluir(null)} className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">Cancelar</button>
              <button type="button" onClick={confirmarExclusao} className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md active:scale-95">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}