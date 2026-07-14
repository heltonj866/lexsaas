import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Eye, AlertCircle, Plus, Edit, Scale, Loader2, DollarSign, Trash2, AlertTriangle, MapPin, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

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

const STATUS_CONFIG = {
  Ativo:     { bg: 'rgba(16,185,129,0.10)',  color: '#6EE7B7',  border: 'rgba(16,185,129,0.20)' },
  Suspenso:  { bg: 'rgba(245,158,11,0.10)',  color: '#FCD34D',  border: 'rgba(245,158,11,0.20)' },
  Arquivado: { bg: 'rgba(100,116,139,0.10)', color: '#94A3B8',  border: 'rgba(100,116,139,0.20)' },
};

function FormField({ label, children }) {
  return (
    <div>
      <label className={LABEL} style={{ color: '#475569' }}>{label}</label>
      {children}
    </div>
  );
}

export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [buscandoCNJ, setBuscandoCNJ] = useState(false);
  const [processoParaExcluir, setProcessoParaExcluir] = useState(null);

  const formVazio = { numero_processo: '', titulo: '', cliente_id: '', status: 'Ativo', descricao: '', valor: '', area: '', vara: '' };
  const [form, setForm] = useState(formVazio);

  async function carregarDados() {
    try {
      setLoading(true);
      const [rP, rC] = await Promise.all([
        api.get(`/processos?search=${busca}`),
        api.get('/clientes'),
      ]);
      setProcessos(rP.data.data ?? rP.data);
      setClientes(rC.data.data ?? rC.data);
    } catch { toast.error('Erro ao carregar dados.'); }
    finally { setLoading(false); }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(carregarDados, 500);
    return () => clearTimeout(t);
  }, [busca]);

  async function consultarCNJ() {
    if (!form.numero_processo || form.numero_processo.length < 15) return toast.error('Digite um NPU válido.');
    const npu = form.numero_processo.replace(/\D/g, '');
    setBuscandoCNJ(true);
    try {
      const res = await api.get(`/processos/cnj/${npu}`);
      setForm(p => ({ ...p, titulo: res.data.classe || p.titulo, vara: res.data.orgao || p.vara, status: 'Ativo' }));
      toast.success('Dados importados do DataJud!');
    } catch { toast.error('NPU não encontrado no CNJ.'); }
    finally { setBuscandoCNJ(false); }
  }

  const handleValorChange = e => {
    let v = e.target.value.replace(/\D/g, '');
    if (!v) { setForm({ ...form, valor: '' }); return; }
    v = (parseInt(v, 10) / 100).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    setForm({ ...form, valor: v });
  };

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      const payload = { ...form, valor: form.valor ? form.valor.replace(/\./g, '').replace(',', '.') : '' };
      if (idEmEdicao) { await api.put(`/processos/${idEmEdicao}`, payload); toast.success('Processo atualizado!'); }
      else { await api.post('/processos', payload); toast.success('Processo registado!'); }
      fecharModal(); carregarDados();
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao salvar.'); }
  }

  function prepararEdicao(p) {
    setIdEmEdicao(p.id);
    setForm({
      numero_processo: p.numero_processo || '', titulo: p.titulo || '', cliente_id: p.cliente_id || '',
      status: p.status || 'Ativo', descricao: p.descricao || '',
      valor: p.valor ? parseFloat(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
      area: p.area || '', vara: p.vara || '',
    });
    setIsModalOpen(true);
  }

  function fecharModal() {
    setIsModalOpen(false); setIdEmEdicao(null); setForm(formVazio);
  }

  async function confirmarExclusao() {
    if (!processoParaExcluir) return;
    try {
      await api.delete(`/processos/${processoParaExcluir.id}`);
      toast.success('Processo excluído.'); setProcessoParaExcluir(null); carregarDados();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao excluir.'); }
  }

  return (
    <div className="space-y-5 animate-enter pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>Processos</h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{processos.length} processo{processos.length !== 1 ? 's' : ''} encontrado{processos.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
            <input
              type="text" placeholder="Buscar NPU ou título..."
              value={busca} onChange={e => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#CBD5E1', outline: 'none', width: '220px' }}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
            <Plus size={16} />
            <span className="hidden sm:inline">Novo Processo</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Processo / NPU', 'Cliente', 'Status', 'Ações'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest ${i === 3 ? 'text-right' : ''}`}
                    style={{ color: '#334155', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="py-12 text-center">
                  <Loader2 size={20} className="animate-spin mx-auto" style={{ color: '#F59E0B' }} />
                </td></tr>
              ) : processos.length > 0 ? processos.map(p => {
                const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.Arquivado;
                return (
                  <tr key={p.id} className="group transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg mt-0.5 shrink-0" style={{ background: 'rgba(124,58,237,0.10)' }}>
                          <Scale size={13} style={{ color: '#A78BFA' }} />
                        </div>
                        <div>
                          <p className="font-bold font-mono text-xs" style={{ color: '#CBD5E1' }}>{p.numero_processo}</p>
                          <p className="text-xs mt-0.5 truncate max-w-[220px]" style={{ color: '#64748B' }}>{p.titulo || p.tipo_acao}</p>
                          {(p.area || p.vara) && (
                            <div className="flex items-center gap-2 mt-1">
                              {p.area && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase badge-violet">{p.area}</span>}
                              {p.vara && <span className="text-[9px] flex items-center gap-1" style={{ color: '#334155' }}><MapPin size={9} />{p.vara.slice(0, 30)}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-sm" style={{ color: '#94A3B8' }}>{p.cliente?.nome || '—'}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold inline-block"
                          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {p.status}
                        </span>
                        {p.valor && (
                          <p className="text-xs font-bold" style={{ color: '#6EE7B7' }}>
                            R$ {parseFloat(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => prepararEdicao(p)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: '#475569' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#F59E0B'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                          <Edit size={14} />
                        </button>
                        <Link to={`/processos/${p.id}`}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: '#475569' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#10B981'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => setProcessoParaExcluir(p)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: '#475569' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="4" className="py-16 text-center">
                  <Briefcase size={32} className="mx-auto mb-3" style={{ color: '#1E293B' }} />
                  <p className="text-sm font-semibold" style={{ color: '#334155' }}>Nenhum processo encontrado</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative w-full sm:max-w-2xl flex flex-col max-h-[92vh] animate-enter"
            style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>

            <div className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.12)' }}>
                  <Scale size={15} style={{ color: '#A78BFA' }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: '#F1F5F9' }}>
                  {idEmEdicao ? 'Editar Processo' : 'Novo Processo'}
                </h2>
              </div>
              <button onClick={fecharModal} className="p-1.5 rounded-lg" style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}>
                <X size={15} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              <form id="form-proc" onSubmit={handleSalvar} className="space-y-4">

                {/* NPU */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <FormField label="Número do Processo (NPU)">
                    <div className="flex gap-2">
                      <input required placeholder="0000000-00.0000.8.18.0000"
                        style={{ ...getInputStyle(), fontFamily: 'monospace' }}
                        value={form.numero_processo}
                        onChange={e => setForm({ ...form, numero_processo: e.target.value })}
                        onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                      {!idEmEdicao && (
                        <button type="button" onClick={consultarCNJ} disabled={buscandoCNJ}
                          className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA' }}>
                          {buscandoCNJ ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                          CNJ
                        </button>
                      )}
                    </div>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Título / Ação">
                    <input required placeholder="Ex: Ação de Indenização"
                      style={getInputStyle()} value={form.titulo}
                      onChange={e => setForm({ ...form, titulo: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </FormField>
                  <FormField label="Cliente Vinculado">
                    <select required style={getInputStyle()} value={form.cliente_id}
                      onChange={e => setForm({ ...form, cliente_id: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <option value="">Selecione um cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Área do Direito">
                    <select style={getInputStyle()} value={form.area}
                      onChange={e => setForm({ ...form, area: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <option value="">Selecione a área...</option>
                      {['Cível','Trabalhista','Criminal','Tributário','Previdenciário','Família e Sucessões','Consumidor','Empresarial','Outros'].map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Vara / Tribunal">
                    <input placeholder="Ex: 1ª Vara Cível"
                      style={getInputStyle()} value={form.vara}
                      onChange={e => setForm({ ...form, vara: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </FormField>
                  <FormField label="Valor da Causa (R$)">
                    <div className="relative">
                      <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#10B981' }} />
                      <input type="text" placeholder="0,00"
                        style={{ ...getInputStyle(), paddingLeft: '28px', fontFamily: 'monospace', color: '#6EE7B7' }}
                        value={form.valor} onChange={handleValorChange}
                        onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>
                  </FormField>
                  <FormField label="Status">
                    <select required style={getInputStyle()} value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <option value="Ativo">Ativo</option>
                      <option value="Suspenso">Suspenso</option>
                      <option value="Arquivado">Arquivado / Encerrado</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Observações Internas">
                  <textarea placeholder="Anotações sobre o andamento..."
                    style={{ ...getInputStyle(), minHeight: '80px', resize: 'none' }}
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </FormField>
              </form>
            </div>

            <div className="px-5 py-4 flex gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={fecharModal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
              <button type="submit" form="form-proc" className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary">Salvar Processo</button>
            </div>
          </div>
        </div>
      )}

      {processoParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setProcessoParaExcluir(null)} />
          <div className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-enter"
            style={{ background: '#131929', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.10)' }}>
              <AlertTriangle size={22} style={{ color: '#EF4444' }} />
            </div>
            <h3 className="text-base font-bold text-center mb-1" style={{ color: '#F1F5F9' }}>Excluir Processo?</h3>
            <p className="text-center text-xs mb-6" style={{ color: '#475569' }}>
              Processo <span className="font-semibold font-mono" style={{ color: '#CBD5E1' }}>{processoParaExcluir.numero_processo}</span> será removido permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setProcessoParaExcluir(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
              <button onClick={confirmarExclusao} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-danger">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}