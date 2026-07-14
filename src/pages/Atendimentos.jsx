import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Clock, Plus, Loader2, Search, DollarSign, Calendar, RefreshCcw, Handshake, CheckCircle2, XCircle, Trash2, Edit, User, X } from 'lucide-react';
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

function FormField({ label, children }) {
  return (
    <div>
      <label className={LABEL} style={{ color: '#475569' }}>{label}</label>
      {children}
    </div>
  );
}

export default function CRM() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nome_cliente: '', telefone_cliente: '', area_interesse: '', valor_proposta: '', historico_conversa: ''
  });
  const [loadingForm, setLoadingForm] = useState(false);

  const carregarDados = async () => {
    try {
      const response = await api.get(`/atendimentos?search=${busca}`);
      setAtendimentos(response.data.data || response.data);
    } catch {
      // Ignora silenciosamente
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(() => {
      if (!document.hidden && !isModalOpen) carregarDados();
    }, 15000);
    return () => clearInterval(intervalo);
  }, [busca, isModalOpen]);

  const formatarNumeroParaWhatsapp = (telefone) => `55${telefone.replace(/\D/g, '')}`;

  const atualizarStatus = async (id, novoStatus) => {
    try {
      setAtendimentos(prev => prev.map(a => a.id === id ? { ...a, status: novoStatus } : a));
      await api.put(`/atendimentos/${id}/status`, { status: novoStatus });
    } catch {
      toast.error("Erro ao atualizar a etapa.");
      carregarDados();
    }
  };

  const converterCliente = async (id) => {
    try {
      toast.loading('A converter lead em cliente...', { id: 'conv' });
      await api.post(`/atendimentos/${id}/converter`);
      toast.success('Cliente gerado com sucesso!', { id: 'conv' });
      carregarDados();
    } catch {
      toast.error('Erro ao converter cliente.', { id: 'conv' });
    }
  };

  const excluirLead = async (id) => {
    if(!window.confirm('Tem certeza que deseja excluir este Lead?')) return;
    try {
      await api.delete(`/atendimentos/${id}`);
      setAtendimentos(prev => prev.filter(a => a.id !== id));
      toast.success("Lead removido.");
    } catch {
      toast.error("Erro ao remover lead.");
    }
  };

  const handleEnviarMensagem = (atendimento, tipo = 'padrao') => {
    const num = formatarNumeroParaWhatsapp(atendimento.telefone_cliente);
    let texto = `Olá${atendimento.nome_cliente ? ' ' + atendimento.nome_cliente.split(' ')[0] : ''}! `;
    
    if (tipo === 'proposta') {
      const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(atendimento.valor_proposta || 0);
      texto += `Estou enviando este contato para formalizar a nossa proposta de honorários no valor de ${valor}. Podemos seguir com a contratação?`;
    } else {
      texto += `Sou o advogado responsável pelo seu atendimento. Como posso ajudar hoje?`;
    }
    
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const handleSalvarLead = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      await api.post('/atendimentos', form);
      toast.success("Lead criado com sucesso!");
      setIsModalOpen(false);
      setForm({ nome_cliente: '', telefone_cliente: '', area_interesse: '', valor_proposta: '', historico_conversa: '' });
      carregarDados();
    } catch {
      toast.error("Erro ao criar lead.");
    } finally {
      setLoadingForm(false);
    }
  };

  const formatarMoeda = (v) => v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$ 0,00';

  const handleDragStart = (e, id) => e.dataTransfer.setData('leadId', id);
  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = async (e, novoStatus) => {
    const id = e.dataTransfer.getData('leadId');
    const lead = atendimentos.find(a => a.id === Number(id));
    if (lead && lead.status !== novoStatus) {
      atualizarStatus(Number(id), novoStatus);
    }
  };

  const funil = [
    { id: 'novo', titulo: 'Novos Leads', icon: User, corTexto: '#F1F5F9', corDestaque: 'rgba(255,255,255,0.1)' },
    { id: 'em_atendimento', titulo: 'Em Atendimento', icon: MessageSquare, corTexto: '#60A5FA', corDestaque: 'rgba(59,130,246,0.1)' },
    { id: 'proposta', titulo: 'Proposta Enviada', icon: DollarSign, corTexto: '#F59E0B', corDestaque: 'rgba(245,158,11,0.1)' },
    { id: 'ganho', titulo: 'Convertido', icon: Handshake, corTexto: '#10B981', corDestaque: 'rgba(16,185,129,0.1)' },
    { id: 'perdido', titulo: 'Perdido', icon: XCircle, corTexto: '#EF4444', corDestaque: 'rgba(239,68,68,0.1)' }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-enter overflow-hidden pb-4">
      
      {/* Header Fixo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 px-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>
            CRM Jurídico <span className="text-[10px] px-2 py-1 rounded-lg uppercase tracking-widest font-bold" style={{ background: 'rgba(124,58,237,0.1)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.2)' }}>Funil de Vendas</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#334155' }} />
            <input 
              type="text" placeholder="Buscar leads..." 
              className="w-full rounded-xl pl-9 pr-4 py-2 text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#CBD5E1', outline: 'none' }}
              value={busca} onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm shrink-0">
            <Plus size={16} /> <span className="hidden sm:inline">Novo Lead</span>
          </button>
        </div>
      </div>

      {loading && atendimentos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin" style={{ color: '#F59E0B' }} />
        </div>
      ) : (
        /* Quadro Kanban */
        <div className="flex-1 flex overflow-x-auto gap-4 px-2 pb-4 snap-x custom-scrollbar">
          {funil.map(coluna => {
            const leads = atendimentos.filter(a => a.status === coluna.id);
            const totalValor = leads.reduce((acc, a) => acc + parseFloat(a.valor_proposta || 0), 0);
            
            return (
              <div key={coluna.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, coluna.id)} 
                   className="snap-center min-w-[320px] w-[320px] flex flex-col rounded-2xl shrink-0"
                   style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.04)' }}>
                
                {/* Cabeçalho da Coluna */}
                <div className="p-4 shrink-0 rounded-t-2xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="font-bold text-xs tracking-wider flex items-center gap-2 uppercase" style={{ color: coluna.corTexto }}>
                      <div className="p-1.5 rounded-lg" style={{ background: coluna.corDestaque }}>
                          <coluna.icon size={14} /> 
                      </div>
                      {coluna.titulo}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: 'rgba(255,255,255,0.05)', color: '#E2E8F0' }}>
                      {leads.length}
                    </span>
                  </div>
                  {totalValor > 0 && (
                    <p className="text-[10px] font-bold mt-2" style={{ color: '#64748B' }}>
                      Volume: <span style={{ color: '#94A3B8' }}>{formatarMoeda(totalValor)}</span>
                    </p>
                  )}
                </div>

                {/* Lista de Leads */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {leads.map(lead => (
                    <div key={lead.id} draggable onDragStart={(e) => handleDragStart(e, lead.id)} 
                         className="p-4 rounded-xl cursor-move transition-all group relative animate-enter"
                         style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.04)' }}
                         onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                         onMouseLeave={e => { e.currentTarget.style.background = '#131929'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                      
                      {/* Botoes de Controle Top-Right */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => excluirLead(lead.id)} className="p-1.5 rounded-lg transition-colors"
                                style={{ color: '#475569' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                            <Trash2 size={14}/>
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-2 pr-6">
                        <h3 className="font-bold text-sm truncate w-full" style={{ color: '#E2E8F0' }} title={lead.nome_cliente || 'Lead Sem Nome'}>
                          {lead.nome_cliente || 'Lead Sem Nome'}
                        </h3>
                      </div>
                      
                      <div className="mb-3 space-y-2">
                        <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
                          <Phone size={12} style={{ color: '#64748B' }} /> {lead.telefone_cliente}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {lead.area_interesse && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>
                              {lead.area_interesse}
                            </span>
                          )}
                          {parseFloat(lead.valor_proposta) > 0 && (
                            <span className="px-2 py-0.5 font-bold text-[9px] rounded flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                              {formatarMoeda(lead.valor_proposta)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] leading-relaxed line-clamp-2 italic mb-4 min-h-[30px]" style={{ color: '#475569' }}>
                        {lead.historico_conversa ? `"${lead.historico_conversa}"` : "Sem notas adicionais."}
                      </div>

                      {/* Ações Inteligentes por Coluna */}
                      <div className="flex flex-wrap gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        {coluna.id === 'proposta' && (
                          <button onClick={() => handleEnviarMensagem(lead, 'proposta')} className="w-full p-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                            <MessageSquare size={12} /> Relembrar Proposta
                          </button>
                        )}

                        {coluna.id === 'ganho' && (
                          <button onClick={() => converterCliente(lead.id)} className="w-full btn-primary p-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 size={12} /> Converter em Cliente
                          </button>
                        )}

                        {coluna.id !== 'ganho' && coluna.id !== 'proposta' && (
                          <button onClick={() => handleEnviarMensagem(lead)} className="flex-1 p-1.5 rounded-lg flex items-center justify-center transition-colors" title="Chamar no WhatsApp"
                                  style={{ background: 'rgba(255,255,255,0.02)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.05)' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
                            <MessageSquare size={14} />
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                  {leads.length === 0 && (
                    <div className="h-20 flex flex-col items-center justify-center rounded-xl opacity-50" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Vazio</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Adicionar Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSalvarLead} className="relative w-full sm:max-w-lg flex flex-col max-h-[92vh] animate-enter"
                style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>
            
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#F1F5F9' }}>
                <Plus size={16} style={{ color: '#A78BFA' }} /> Adicionar Lead
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg" style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}>
                  <X size={15} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <FormField label="Nome do Lead">
                    <input required type="text" style={getInputStyle()} value={form.nome_cliente} onChange={e => setForm({...form, nome_cliente: e.target.value})} placeholder="Ex: João Silva" 
                           onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </FormField>
                </div>
                <div>
                  <FormField label="WhatsApp">
                    <input required type="text" style={getInputStyle()} value={form.telefone_cliente} onChange={e => setForm({...form, telefone_cliente: e.target.value})} placeholder="(11) 99999-9999" 
                           onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </FormField>
                </div>
                <div>
                  <FormField label="Valor da Proposta (R$)">
                    <input type="number" step="0.01" style={getInputStyle()} value={form.valor_proposta} onChange={e => setForm({...form, valor_proposta: e.target.value})} placeholder="0.00" 
                           onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </FormField>
                </div>
                <div className="col-span-2">
                  <FormField label="Área de Interesse">
                    <select style={getInputStyle()} value={form.area_interesse} onChange={e => setForm({...form, area_interesse: e.target.value})}
                            onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                      <option value="">Selecione...</option>
                      <option value="Trabalhista">Trabalhista</option>
                      <option value="Família">Família</option>
                      <option value="Cível">Cível</option>
                      <option value="Empresarial">Empresarial</option>
                      <option value="Criminal">Criminal</option>
                    </select>
                  </FormField>
                </div>
                <div className="col-span-2">
                  <FormField label="Anotações Iniciais">
                    <textarea rows="3" style={{...getInputStyle(), resize: 'none'}} value={form.historico_conversa} onChange={e => setForm({...form, historico_conversa: e.target.value})} placeholder="O cliente procurou-nos para..." 
                              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 flex gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
              <button type="submit" disabled={loadingForm} className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary disabled:opacity-50">
                {loadingForm && <Loader2 size={16} className="animate-spin" />}
                Criar Lead
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}