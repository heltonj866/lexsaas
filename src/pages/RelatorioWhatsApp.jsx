import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Target, Users, Clock, CheckCircle, MessageCircle, ArrowUpRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function RelatorioWhatsApp() {
  const [dados, setDados] = useState({ total: 0, porArea: [], porStatus: [], ultimosLeads: [] });
  const [loading, setLoading] = useState(true);

  // Paleta de Cores IURIS Premium
  const CORES_AREA = ['#A78BFA', '#F472B6', '#FBBF24', '#34D399', '#60A5FA'];
  
  useEffect(() => {
    async function carregarRelatorio() {
      try {
        const response = await api.get('/atendimentos/relatorio');
        setDados(response.data);
      } catch {
        toast.error("Erro ao carregar dados do relatório.");
      } finally {
        setLoading(false);
      }
    }
    carregarRelatorio();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin" style={{ color: '#F59E0B' }} />
      </div>
    );
  }

  // Cálculos Auxiliares
  const aguardando = dados.porStatus.find(s => s.name === 'novo')?.value || 0;
  const emAtendimento = dados.porStatus.find(s => s.name === 'em_atendimento')?.value || 0;
  const convertidos = dados.porStatus.find(s => s.name === 'finalizado')?.value || 0;
  const taxaConversao = dados.total > 0 ? ((convertidos / dados.total) * 100).toFixed(1) : 0;

  // Formatação para o gráfico de barras
  const dadosFunil = [
    { name: 'Triagem (Novos)', leads: aguardando, fill: '#EF4444' },
    { name: 'Negociação', leads: emAtendimento, fill: '#8B5CF6' },
    { name: 'Fechados', leads: convertidos, fill: '#10B981' }
  ];

  return (
    <div className="space-y-5 animate-enter pb-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>
            <Target size={24} style={{ color: '#A78BFA' }} /> Métricas de Tráfego
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            Análise de performance e conversão dos leads capturados via WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CalendarIcon size={14} style={{ color: '#64748B' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#E2E8F0' }}>Tempo Real</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between transition-all group" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <Users size={18} style={{ color: '#3B82F6' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Total Leads</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black" style={{ color: '#F1F5F9' }}>{dados.total}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between transition-all group" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <MessageCircle size={18} style={{ color: '#EF4444' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Aguardando</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black" style={{ color: '#F1F5F9' }}>{aguardando}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between transition-all group" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <Clock size={18} style={{ color: '#8B5CF6' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>Em Negociação</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black" style={{ color: '#F1F5F9' }}>{emAtendimento}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all group"
             style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="absolute right-0 top-0 w-1 h-full" style={{ background: '#10B981' }}></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <CheckCircle size={18} style={{ color: '#10B981' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#10B981' }}>Conversão</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black" style={{ color: '#6EE7B7' }}>{taxaConversao}%</h3>
            <span className="text-[9px] font-bold uppercase tracking-widest pb-1" style={{ color: 'rgba(16,185,129,0.7)' }}>Taxa de sucesso</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto min-h-[380px]">
        {/* Gráfico 1: Área de Interesse */}
        <div className="glass-card p-6 rounded-2xl flex flex-col" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-6" style={{ color: '#F1F5F9' }}>
            <Target size={16} style={{ color: '#64748B' }} /> Distribuição por Área
          </h2>
          <div className="flex-1 min-h-[250px] w-full">
            {dados.porArea.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dados.porArea} cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={3} dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {dados.porArea.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_AREA[index % CORES_AREA.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Leads`, 'Quantidade']}
                    contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} 
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs" style={{ color: '#64748B' }}>Aguardando dados...</div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Funil de Status */}
        <div className="glass-card p-6 rounded-2xl flex flex-col" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-6" style={{ color: '#F1F5F9' }}>
            <ArrowUpRight size={16} style={{ color: '#64748B' }} /> Funil de Conversão
          </h2>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosFunil} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} 
                />
                <Bar dataKey="leads" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Dados Detalhados */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Últimos Leads Capturados</h2>
          <p className="text-[10px]" style={{ color: '#64748B' }}>Histórico recente de triagem automática.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#334155', background: 'rgba(255,255,255,0.02)' }}>Cliente / Telefone</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#334155', background: 'rgba(255,255,255,0.02)' }}>Área Solicitada</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#334155', background: 'rgba(255,255,255,0.02)' }}>Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-right" style={{ color: '#334155', background: 'rgba(255,255,255,0.02)' }}>Data de Entrada</th>
              </tr>
            </thead>
            <tbody>
              {dados.ultimosLeads.length > 0 ? (
                dados.ultimosLeads.map((lead) => (
                  <tr key={lead.id} className="transition-colors group"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-sm" style={{ color: '#E2E8F0' }}>{lead.nome_cliente || 'Desconhecido'}</div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: '#64748B' }}>{lead.telefone_cliente}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-1 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>
                        {lead.area_interesse || 'Não informada'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {lead.status === 'novo' && (
                        <span className="px-2 py-1 rounded text-[9px] font-bold uppercase flex w-max items-center gap-1.5" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Aguardando
                        </span>
                      )}
                      {lead.status === 'em_atendimento' && (
                        <span className="px-2 py-1 rounded text-[9px] font-bold uppercase flex w-max items-center gap-1.5" style={{ background: 'rgba(124,58,237,0.1)', color: '#A78BFA' }}>
                            <Clock size={10}/> Em Negociação
                        </span>
                      )}
                      {lead.status === 'finalizado' && (
                        <span className="px-2 py-1 rounded text-[9px] font-bold uppercase flex w-max items-center gap-1.5" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                            <CheckCircle size={10}/> Fechado
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[11px] font-medium" style={{ color: '#64748B' }}>
                      {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-xs" style={{ color: '#64748B' }}>Nenhum lead capturado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}