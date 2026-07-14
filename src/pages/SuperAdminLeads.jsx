import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Clock, Lock, ShieldCheck, CheckCircle2, Loader2, Search } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SuperAdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/superadmin/leads');
      setLeads(response.data);
    } catch {
      toast.error('Erro ao buscar leads. Apenas Super Admins têm acesso.');
    } finally {
      setLoading(false);
    }
  };

  const alterarStatus = async (id, novoStatus) => {
    try {
      await api.put(`/superadmin/leads/${id}/status`, { status: novoStatus });
      toast.success(`Status atualizado para ${novoStatus}!`);
      fetchLeads(); 
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  const openWhatsApp = (telefone) => {
    if (!telefone) return toast.error('Sem número registado.');
    const num = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/${num}?text=Olá, vi que você criou uma conta de teste no IURIS! Como posso ajudar a configurar o seu escritório?`, '_blank');
  };

  const leadsFiltrados = leads.filter(l => 
    l.nome_escritorio?.toLowerCase().includes(busca.toLowerCase()) || 
    l.admin_nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-enter pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>
            <ShieldCheck size={24} style={{ color: '#F59E0B' }} /> Central de Leads (Master)
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Visão global de todos os escritórios registrados e status do Free Trial.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: '#334155' }} />
            <input 
              type="text" placeholder="Buscar escritórios..." 
              className="w-full rounded-xl pl-9 pr-4 py-2 text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#CBD5E1', outline: 'none' }}
              value={busca} onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Total:</span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F59E0B' }}>{leads.length}</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Escritório', 'Responsável', 'Contato', 'Status / Trial', 'Ações (Aprovação)'].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}
                        style={{ color: '#334155', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center">
                  <Loader2 size={20} className="animate-spin mx-auto" style={{ color: '#F59E0B' }} />
                </td></tr>
              ) : leadsFiltrados.length > 0 ? (
                leadsFiltrados.map(lead => {
                  const trialEndsAt = new Date(lead.trial_ends_at);
                  const isExpired = lead.status === 'trial' && new Date() > trialEndsAt;
                  
                  let statusBadge = null;
                  if (lead.status === 'ativo') statusBadge = <span className="px-2 py-1 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>Pago / Ativo</span>;
                  else if (lead.status === 'bloqueado') statusBadge = <span className="px-2 py-1 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Bloqueado</span>;
                  else if (isExpired) statusBadge = <span className="px-2 py-1 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>Trial Expirado</span>;
                  else statusBadge = <span className="px-2 py-1 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>Trial Ativo</span>;

                  return (
                    <tr key={lead.id} className="group transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      
                      <td className="px-5 py-3.5 font-bold" style={{ color: '#E2E8F0' }}>
                        {lead.nome_escritorio}
                      </td>
                      
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-sm" style={{ color: '#E2E8F0' }}>{lead.admin_nome}</div>
                        <div className="text-[10px] mt-0.5 flex items-center gap-1.5" style={{ color: '#64748B' }}>
                          <Mail size={10} /> {lead.admin_email}
                        </div>
                      </td>
                      
                      <td className="px-5 py-3.5">
                        <button onClick={() => openWhatsApp(lead.telefone_responsavel)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                          <Phone size={12} /> {lead.telefone_responsavel || 'Sem Nº'}
                        </button>
                      </td>
                      
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          {statusBadge}
                          {lead.status === 'trial' && lead.trial_ends_at && (
                            <span className="text-[9px] flex items-center gap-1 font-medium" style={{ color: '#64748B' }}>
                              <Clock size={10} /> Expira: {new Date(lead.trial_ends_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {lead.status !== 'ativo' && (
                            <button onClick={() => alterarStatus(lead.id, 'ativo')}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: '#475569' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#10B981'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                                    title="Ativar Conta (Marcar Pago)">
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {lead.status !== 'bloqueado' && (
                            <button onClick={() => alterarStatus(lead.id, 'bloqueado')}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: '#475569' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                                    title="Bloquear Acesso">
                              <Lock size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <ShieldCheck size={32} className="mx-auto mb-3" style={{ color: '#1E293B' }} />
                    <p className="text-sm font-semibold" style={{ color: '#334155' }}>Nenhum escritório registrado ainda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
