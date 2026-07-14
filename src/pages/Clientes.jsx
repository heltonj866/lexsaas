import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, X, ChevronLeft, ChevronRight, User, AlertTriangle, MapPin, Mail, Phone, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
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

function FormField({ label, children }) {
  return (
    <div>
      <label className={LABEL} style={{ color: '#475569' }}>{label}</label>
      {children}
    </div>
  );
}

function DeleteModal({ item, onConfirm, onCancel, type = 'cliente' }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-enter"
        style={{ background: '#131929', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.10)' }}>
          <AlertTriangle size={22} style={{ color: '#EF4444' }} />
        </div>
        <h3 className="text-base font-bold text-center mb-1" style={{ color: '#F1F5F9' }}>Excluir {type}?</h3>
        <p className="text-center text-xs mb-6" style={{ color: '#475569' }}>
          Esta ação removerá <span className="font-semibold" style={{ color: '#CBD5E1' }}>{item.nome}</span> permanentemente.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);

  const formVazio = { nome: '', email: '', telefone: '', cpf_cnpj: '', cep: '', endereco: '', bairro: '', cidade: '' };
  const [novoCliente, setNovoCliente] = useState(formVazio);

  async function carregarClientes(page = 1) {
    try {
      setLoading(true);
      const res = await api.get(`/clientes?page=${page}&busca=${busca}`);
      setClientes(res.data.data);
      setPaginaAtual(res.data.current_page);
      setUltimaPagina(res.data.last_page);
      setTotalRegistros(res.data.total);
    } catch { toast.error('Erro ao carregar clientes.'); setClientes([]); }
    finally { setLoading(false); }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => carregarClientes(1), 500);
    return () => clearTimeout(t);
  }, [busca]);

  async function buscarCep(cep) {
    const v = cep?.replace(/\D/g, '') || '';
    if (v.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${v}/json/`);
      const d = await res.json();
      if (!d.erro) {
        setNovoCliente(p => ({ ...p, endereco: d.logradouro, bairro: d.bairro, cidade: `${d.localidade} - ${d.uf}` }));
        toast.success('Endereço preenchido!');
      } else toast.error('CEP não encontrado.');
    } catch { toast.error('Erro na busca do CEP.'); }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      if (editandoId) { await api.put(`/clientes/${editandoId}`, novoCliente); toast.success('Cliente atualizado!'); }
      else { await api.post('/clientes', novoCliente); toast.success('Cliente registado!'); }
      fecharGaveta(); carregarClientes(paginaAtual);
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao guardar.'); }
  }

  function abrirEdicao(c) {
    setNovoCliente({ nome: c.nome||'', email: c.email||'', telefone: c.telefone||'', cpf_cnpj: c.cpf_cnpj||'', cep: c.cep||'', endereco: c.endereco||'', bairro: c.bairro||'', cidade: c.cidade||'' });
    setEditandoId(c.id); setIsDrawerOpen(true);
  }

  function abrirNovo() { setNovoCliente(formVazio); setEditandoId(null); setIsDrawerOpen(true); }

  function fecharGaveta() {
    setIsDrawerOpen(false);
    setTimeout(() => { setNovoCliente(formVazio); setEditandoId(null); }, 300);
  }

  async function confirmarExclusao() {
    if (!clienteParaExcluir) return;
    try {
      await api.delete(`/clientes/${clienteParaExcluir.id}`);
      toast.success('Cliente excluído!'); setClienteParaExcluir(null); carregarClientes(paginaAtual);
    } catch { toast.error('Erro ao excluir.'); }
  }

  // Gera iniciais coloridas por nome
  const getAvatarColor = (name = '') => {
    const colors = ['#3B82F6','#7C3AED','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="space-y-5 animate-enter pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>Clientes</h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            {totalRegistros} cliente{totalRegistros !== 1 ? 's' : ''} na carteira
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
            <input
              type="text" placeholder="Buscar por nome ou CPF..."
              value={busca} onChange={e => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#CBD5E1', outline: 'none', width: '220px' }}
            />
          </div>
          <button onClick={abrirNovo}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Cliente', 'Documento', 'Contato', 'Ações'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest ${i === 3 ? 'text-right' : ''}`}
                    style={{ color: '#334155', background: 'rgba(255,255,255,0.02)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {[3, 2, 2, 1].map((w, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="skeleton h-4 rounded" style={{ width: `${w * 25}%` }} />
                    </td>
                  ))}
                </tr>
              )) : clientes.length > 0 ? clientes.map(c => (
                <tr key={c.id} className="group transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: getAvatarColor(c.nome) + '22', color: getAvatarColor(c.nome), border: `1px solid ${getAvatarColor(c.nome)}33` }}>
                        {c.nome?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>{c.nome}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Hash size={11} style={{ color: '#334155' }} />
                      <span className="font-mono text-xs" style={{ color: '#64748B' }}>{c.cpf_cnpj || '—'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail size={10} style={{ color: '#334155' }} />
                          <span className="text-xs" style={{ color: '#64748B' }}>{c.email}</span>
                        </div>
                      )}
                      {c.telefone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={10} style={{ color: '#334155' }} />
                          <span className="text-xs" style={{ color: '#64748B' }}>{c.telefone}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/clientes/${c.id}`}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#475569' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60A5FA'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                        title="Ver ficha">
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => abrirEdicao(c)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#475569' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#F59E0B'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                        title="Editar">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => setClienteParaExcluir(c)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#475569' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                        title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <User size={32} className="mx-auto mb-3" style={{ color: '#1E293B' }} />
                    <p className="text-sm font-semibold" style={{ color: '#334155' }}>Nenhum cliente encontrado</p>
                    <p className="text-xs mt-1" style={{ color: '#1E293B' }}>Adicione seu primeiro cliente acima</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs" style={{ color: '#334155' }}>
            Página <span className="font-bold" style={{ color: '#64748B' }}>{paginaAtual}</span> de <span className="font-bold" style={{ color: '#64748B' }}>{ultimaPagina}</span>
          </p>
          <div className="flex gap-1.5">
            <button onClick={() => carregarClientes(paginaAtual - 1)} disabled={paginaAtual === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => carregarClientes(paginaAtual + 1)} disabled={paginaAtual === ultimaPagina}
              className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fecharGaveta} />
          <div className="relative w-full sm:max-w-md h-full flex flex-col animate-enter"
            style={{ background: '#0D1117', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#F1F5F9' }}>
                  {editandoId ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Preencha os dados abaixo</p>
              </div>
              <button onClick={fecharGaveta} className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#E2E8F0'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <form id="form-cliente" onSubmit={handleSalvar} className="space-y-4">
                <FormField label="Nome Completo">
                  <input type="text" required placeholder="Nome do cliente"
                    style={getInputStyle()} value={novoCliente.nome}
                    onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="E-mail">
                    <input type="email" placeholder="cliente@email.com"
                      style={getInputStyle()} value={novoCliente.email}
                      onChange={e => setNovoCliente({ ...novoCliente, email: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </FormField>
                  <FormField label="Telefone">
                    <input type="text" placeholder="(00) 00000-0000"
                      style={getInputStyle()} value={novoCliente.telefone}
                      onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </FormField>
                </div>

                <FormField label="CPF / CNPJ">
                  <input type="text" required placeholder="000.000.000-00"
                    style={getInputStyle()} value={novoCliente.cpf_cnpj}
                    onChange={e => setNovoCliente({ ...novoCliente, cpf_cnpj: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </FormField>

                {/* Address block */}
                <div className="p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={12} style={{ color: '#F59E0B' }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F59E0B' }}>Endereço</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <FormField label="CEP">
                        <input type="text" placeholder="00000-000"
                          style={getInputStyle()} value={novoCliente.cep}
                          onChange={e => setNovoCliente({ ...novoCliente, cep: e.target.value })}
                          onBlur={e => buscarCep(e.target.value)}
                          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                        />
                      </FormField>
                    </div>
                    <div className="col-span-2">
                      <FormField label="Cidade / UF">
                        <input type="text" readOnly placeholder="Automático"
                          style={{ ...getInputStyle(), opacity: 0.6, cursor: 'not-allowed' }}
                          value={novoCliente.cidade}
                        />
                      </FormField>
                    </div>
                  </div>
                  <FormField label="Logradouro / Bairro">
                    <input type="text" readOnly placeholder="Automático"
                      style={{ ...getInputStyle(), opacity: 0.6, cursor: 'not-allowed' }}
                      value={novoCliente.endereco ? `${novoCliente.endereco}, ${novoCliente.bairro}` : ''}
                    />
                  </FormField>
                </div>
              </form>
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-4 flex gap-3 shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={fecharGaveta}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors btn-ghost">
                Cancelar
              </button>
              <button type="submit" form="form-cliente"
                className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary">
                {editandoId ? 'Atualizar' : 'Salvar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {clienteParaExcluir && (
        <DeleteModal
          item={clienteParaExcluir}
          onConfirm={confirmarExclusao}
          onCancel={() => setClienteParaExcluir(null)}
        />
      )}
    </div>
  );
}