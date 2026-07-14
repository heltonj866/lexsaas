import { useState, useEffect } from 'react';
import { Plus, Edit, DollarSign, TrendingUp, TrendingDown, Wallet, Users, Briefcase, Loader2, Trash2, AlertTriangle, AlertCircle, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import FaturaModal from '../components/FaturaModal';

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

function FormField({ label, children }) {
  return (
    <div>
      <label className={LABEL} style={{ color: '#475569' }}>{label}</label>
      {children}
    </div>
  );
}

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [processos, setProcessos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);

  const [lancamentoParaExcluir, setLancamentoParaExcluir] = useState(null);
  const [faturaParaGerar, setFaturaParaGerar] = useState(null);
  const [filtroAtual, setFiltroAtual] = useState('todos'); // 'todos', 'receitas', 'despesas', 'pendentes', 'atrasados'

  const [form, setForm] = useState({
    descricao: '', valor: '', tipo: 'receita', categoria: 'honorarios', data_vencimento: '', status: 'pendente', processo_id: '', cliente_id: '', metodo_pagamento: ''
  });

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
    } catch { toast.error("Erro ao carregar dados."); } finally { setLoading(false); }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps

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
    } catch { toast.error("Erro ao salvar."); }
  }

  async function confirmarExclusao() {
    if (!lancamentoParaExcluir) return;
    try { 
        await api.delete(`/financeiro/${lancamentoParaExcluir.id}`); 
        toast.success("Lançamento excluído com sucesso!"); 
        setLancamentoParaExcluir(null); 
        carregarDados(); 
    } catch { 
        toast.error("Erro ao excluir lançamento."); 
    }
  }

  async function alternarStatus(lancamento) {
    const novoStatus = lancamento.status === 'pago' ? 'pendente' : 'pago';
    try { 
        await api.put(`/financeiro/${lancamento.id}`, { ...lancamento, status: novoStatus }); 
        carregarDados(); 
        toast.success(novoStatus === 'pago' ? 'Marcado como concluído!' : 'Marcado como pendente!');
    } catch { toast.error("Erro ao atualizar o status."); }
  }

  function prepararEdicao(item) {
    setIdEmEdicao(item.id);
    setForm({
      descricao: item.descricao || '', valor: item.valor || '', tipo: item.tipo || 'receita', categoria: item.categoria || 'honorarios', 
      data_vencimento: item.data_vencimento ? item.data_vencimento.split('T')[0] : '', status: item.status || 'pendente', 
      processo_id: item.processo_id || '', cliente_id: item.cliente_id || '', metodo_pagamento: item.metodo_pagamento || ''
    });
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false); setIdEmEdicao(null);
    setForm({ descricao: '', valor: '', tipo: 'receita', categoria: 'honorarios', data_vencimento: '', status: 'pendente', processo_id: '', cliente_id: '', metodo_pagamento: '' });
  }

  const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const renderStatusButton = (lancamento) => {
    const isReceita = lancamento.tipo === 'receita';
    const isPago = lancamento.status === 'pago';
    
    let texto = isPago ? (isReceita ? 'Recebido' : 'Pago') : (isReceita ? 'A Receber' : 'A Pagar');
    
    // IURIS Premium styling for status badge buttons
    const estilo = isPago
      ? { background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }
      : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' };

    return (
      <button 
        onClick={() => alternarStatus(lancamento)} 
        className="px-2 py-1 rounded text-[10px] font-bold uppercase transition-all"
        style={estilo}
        onMouseEnter={e => { e.currentTarget.style.background = isPago ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = isPago ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'; }}
      >
        {texto}
      </button>
    );
  };

  return (
    <div className="space-y-5 animate-enter pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>Financeiro</h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Fluxo de caixa e honorários</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> Nova Movimentação
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl group transition-all" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2 mb-2 font-bold text-[10px] uppercase tracking-wider" style={{ color: '#10B981' }}>
                <TrendingUp size={14}/> Receitas
            </div>
            <p className="text-2xl font-black" style={{ color: '#F1F5F9' }}>{formatarMoeda(resumo.receitas)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl group transition-all" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2 mb-2 font-bold text-[10px] uppercase tracking-wider" style={{ color: '#EF4444' }}>
                <TrendingDown size={14}/> Despesas
            </div>
            <p className="text-2xl font-black" style={{ color: '#F1F5F9' }}>{formatarMoeda(resumo.despesas)}</p>
        </div>
        <div className="p-5 rounded-2xl transition-all shadow-lg" 
             style={{ 
                background: resumo.saldo >= 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${resumo.saldo >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
             }}>
          <div className="flex items-center gap-2 mb-2 font-bold text-[10px] uppercase tracking-wider" 
               style={{ color: resumo.saldo >= 0 ? '#10B981' : '#EF4444' }}>
               <Wallet size={14}/> Saldo Total
          </div>
          <p className="text-2xl font-black" style={{ color: resumo.saldo >= 0 ? '#6EE7B7' : '#FCA5A5' }}>
              {formatarMoeda(resumo.saldo)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['todos', 'receitas', 'despesas', 'pendentes', 'atrasados'].map(f => (
          <button 
            key={f} 
            onClick={() => setFiltroAtual(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
            style={{ 
                background: filtroAtual === f ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.02)',
                color: filtroAtual === f ? '#A78BFA' : '#64748B',
                border: `1px solid ${filtroAtual === f ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)'}`
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Descrição', 'Tipo', 'Valor', 'Vencimento', 'Status', 'Ações'].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}
                          style={{ color: '#334155', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center">
                  <Loader2 size={20} className="animate-spin mx-auto" style={{ color: '#F59E0B' }} />
                </td></tr>
              ) : lancamentos.length > 0 ? lancamentos.filter(l => {
                const isAtrasado = new Date(l.data_vencimento) < new Date() && l.status === 'pendente';
                if (filtroAtual === 'receitas') return l.tipo === 'receita';
                if (filtroAtual === 'despesas') return l.tipo === 'despesa';
                if (filtroAtual === 'pendentes') return l.status === 'pendente';
                if (filtroAtual === 'atrasados') return isAtrasado;
                return true;
              }).map((l) => {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataVenc = new Date(l.data_vencimento);
                const isAtrasado = dataVenc < hoje && l.status === 'pendente';

                return (
                  <tr key={l.id} className="group transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-sm flex items-center gap-2" style={{ color: '#E2E8F0' }}>
                        {isAtrasado && <AlertCircle size={14} style={{ color: '#EF4444' }} title="Conta em atraso!" />}
                        {l.descricao}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] mt-1" style={{ color: '#64748B' }}>
                        {l.processo?.numero_processo ? <><Briefcase size={10}/> {l.processo.numero_processo}</> : ''}
                        {!l.processo?.numero_processo && l.cliente?.nome ? <><Users size={10}/> {l.cliente.nome}</> : ''}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                        <span className="px-2 py-1 rounded text-[9px] font-bold uppercase"
                              style={l.tipo === 'receita' ? { background: 'rgba(16,185,129,0.1)', color: '#10B981' } : { background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                            {l.tipo}
                        </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: l.tipo === 'receita' ? '#34D399' : '#FCA5A5' }}>
                        {l.tipo === 'despesa' && '-'} {formatarMoeda(l.valor)}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium" style={{ color: isAtrasado ? '#EF4444' : '#94A3B8' }}>
                      {dataVenc.toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                      {isAtrasado && <span className="block text-[9px] font-bold mt-0.5" style={{ color: '#EF4444' }}>VENCIDO</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {renderStatusButton(l)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {l.tipo === 'receita' && (
                                <button onClick={() => setFaturaParaGerar(l)} className="p-1.5 rounded-lg transition-colors"
                                        style={{ color: '#475569' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60A5FA'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                                        title="Gerar Fatura em PDF">
                                <FileText size={14} />
                                </button>
                            )}
                            <button onClick={() => prepararEdicao(l)} className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: '#475569' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#F59E0B'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                                <Edit size={14} />
                            </button>
                            <button onClick={() => setLancamentoParaExcluir(l)} className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: '#475569' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </td>
                  </tr>
                );
              }) : (
                  <tr><td colSpan="6" className="py-16 text-center">
                  <Wallet size={32} className="mx-auto mb-3" style={{ color: '#1E293B' }} />
                  <p className="text-sm font-semibold" style={{ color: '#334155' }}>Nenhuma movimentação encontrada</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Movimentação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative w-full sm:max-w-lg flex flex-col max-h-[92vh] animate-enter"
               style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>
            
            <div className="flex items-center justify-between px-5 py-4 shrink-0"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.12)' }}>
                        <DollarSign size={15} style={{ color: '#A78BFA' }} />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: '#F1F5F9' }}>
                    {idEmEdicao ? 'Editar Lançamento' : 'Novo Lançamento'}
                    </h2>
                </div>
                <button onClick={fecharModal} className="p-1.5 rounded-lg" style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}>
                    <X size={15} />
                </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-5">
              <form id="form-fin" onSubmit={handleSalvar} className="space-y-4">
                
                <div className="flex gap-2 p-1 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <button type="button" onClick={() => setForm({...form, tipo: 'receita'})} 
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                          style={form.tipo === 'receita' ? { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' } : { color: '#64748B' }}>
                      RECEITA
                  </button>
                  <button type="button" onClick={() => setForm({...form, tipo: 'despesa'})} 
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                          style={form.tipo === 'despesa' ? { background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' } : { color: '#64748B' }}>
                      DESPESA
                  </button>
                </div>
                
                <FormField label="Descrição do Lançamento">
                  <input required style={getInputStyle()} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Ex: Honorários Iniciais, Aluguel..." 
                         onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                         onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </FormField>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <FormField label="Valor (R$)">
                    <input type="number" step="0.01" required style={{...getInputStyle(), color: form.tipo === 'receita' ? '#6EE7B7' : '#FCA5A5', fontFamily: 'monospace'}} value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} placeholder="0.00" 
                           onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                           onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </FormField>
                  <FormField label="Data de Vencimento">
                    <input type="date" required style={{...getInputStyle(), colorScheme: 'dark'}} value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} 
                           onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                           onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </FormField>
                  
                  {form.tipo === 'receita' && (
                    <FormField label="Forma de Pagamento">
                      <select style={getInputStyle()} value={form.metodo_pagamento} onChange={e => setForm({...form, metodo_pagamento: e.target.value})}
                              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                        <option value="">A definir</option>
                        <option value="Pix">Pix</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Boleto">Boleto Bancário</option>
                        <option value="Transferência">Transferência</option>
                        <option value="Dinheiro">Dinheiro</option>
                      </select>
                    </FormField>
                  )}
                </div>
                
                <div className="p-4 rounded-xl border-dashed mt-4 space-y-4" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <FormField label="Vincular Cliente (Opcional)">
                      <select style={getInputStyle()} value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}
                              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                        <option value="">Geral / Despesa do Escritório</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Vincular Processo (Opcional)">
                      <select style={getInputStyle()} value={form.processo_id} onChange={e => setForm({...form, processo_id: e.target.value})}
                              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                        <option value="">Sem processo</option>
                        {processos.map(p => <option key={p.id} value={p.id}>{p.numero_processo}</option>)}
                      </select>
                    </FormField>
                </div>
              </form>
            </div>
            
            <div className="px-5 py-4 flex gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={fecharModal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
              <button type="submit" form="form-fin" className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary">Salvar Lançamento</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exclusão */}
      {lancamentoParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setLancamentoParaExcluir(null)} />
          <div className="relative rounded-2xl p-6 max-w-sm w-full animate-enter"
               style={{ background: '#131929', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.10)' }}>
              <AlertTriangle size={22} style={{ color: '#EF4444' }} />
            </div>
            <h3 className="text-base font-bold text-center mb-1" style={{ color: '#F1F5F9' }}>Excluir Lançamento?</h3>
            <p className="text-center text-xs mb-6" style={{ color: '#475569' }}>
              Deseja excluir o lançamento de <span className="font-semibold" style={{ color: '#CBD5E1' }}>{formatarMoeda(lancamentoParaExcluir.valor)}</span>?
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setLancamentoParaExcluir(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
              <button type="button" onClick={confirmarExclusao} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-danger">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fatura PDF */}
      <FaturaModal 
        isOpen={!!faturaParaGerar} 
        onClose={() => setFaturaParaGerar(null)} 
        lancamento={faturaParaGerar} 
      />

    </div>
  );
}