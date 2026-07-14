import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, FileText, Calendar as CalendarIcon,
  TrendingUp, PlusCircle, ArrowRight, AlertCircle, ChevronLeft, ChevronRight,
  MessageSquare, Clock, CheckCircle, Sparkles, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CustomToolbar = (toolbar) => {
  const translateView = (v) => ({ month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' }[v] || v);
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-3 mb-5">
      <div className="flex items-center gap-2">
        <button onClick={() => toolbar.onNavigate('TODAY')}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>
          Hoje
        </button>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={() => toolbar.onNavigate('PREV')}
            className="p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: '#64748B' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => toolbar.onNavigate('NEXT')}
            className="p-1.5 transition-colors hover:bg-white/[0.05] border-l" style={{ color: '#64748B', borderColor: 'rgba(255,255,255,0.08)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <span className="text-base font-bold capitalize" style={{ color: '#E2E8F0' }}>
        {toolbar.label}
      </span>

      <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {toolbar.views.map(v => (
          <button key={v} onClick={() => toolbar.onView(v)}
            className="px-3 py-1.5 text-xs font-semibold capitalize transition-colors border-r last:border-r-0"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              background: toolbar.view === v ? 'rgba(245,158,11,0.1)' : 'transparent',
              color: toolbar.view === v ? '#F59E0B' : '#64748B'
            }}>
            {translateView(v)}
          </button>
        ))}
      </div>
    </div>
  );
};

const METRIC_CARDS = (stats) => [
  {
    icon: Users,
    label: 'Clientes',
    value: stats.totalClientes,
    sub: 'ativos no sistema',
    accent: '#3B82F6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.15)'
  },
  {
    icon: Briefcase,
    label: 'Processos',
    value: stats.processosAtivos,
    sub: 'em andamento',
    accent: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.15)'
  },
  {
    icon: FileText,
    label: 'Documentos',
    value: stats.documentos,
    sub: 'no cofre digital',
    accent: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.15)'
  },
  {
    icon: CalendarIcon,
    label: 'Pendências',
    value: stats.tarefasPendentes,
    sub: 'tarefas abertas',
    accent: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    highlight: true
  },
];

const getSaudacao = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalClientes: 0, processosAtivos: 0, documentos: 0, tarefasPendentes: 0, tarefas: [] });
  const [dataCalendario, setDataCalendario] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState('month');

  const nomeExibicao = user?.name ? user.name.split(' ')[0] : 'Advogado';

  async function carregarMetricas() {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch {
      toast.error('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { carregarMetricas(); }, []);

  const eventosCalendario = (stats.tarefas || []).map(t => ({
    id: t.id,
    title: `${t.prioridade === 'urgente' ? '🚨 ' : ''}${t.titulo}`,
    start: new Date(t.data_vencimento),
    end: new Date(t.data_vencimento),
    resource: t
  }));

  const eventPropGetter = (event) => {
    const colors = { urgente: '#EF4444', alta: '#F59E0B', media: '#7C3AED', baixa: '#10B981' };
    const bg = colors[event.resource.prioridade] || '#6366F1';
    return { style: { backgroundColor: bg + '22', border: `1px solid ${bg}44`, color: bg, borderRadius: '4px', fontSize: '10px', fontWeight: '600', padding: '2px 6px' } };
  };

  const metrics = METRIC_CARDS(stats);

  const urgentTasks = (stats.tarefas || []).filter(t => t.prioridade === 'urgente' || t.prioridade === 'alta').slice(0, 5);
  const otherTasks = (stats.tarefas || []).filter(t => t.prioridade !== 'urgente' && t.prioridade !== 'alta').slice(0, 3);
  const displayTasks = [...urgentTasks, ...otherTasks].slice(0, 6);

  const priorityConfig = {
    urgente: { label: 'Urgente', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)' },
    alta:    { label: 'Alta',    color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)' },
    media:   { label: 'Média',   color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.20)' },
    baixa:   { label: 'Baixa',   color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.20)' },
  };

  return (
    <div className="space-y-6 pb-10 animate-enter">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: '#F59E0B' }} />
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#475569' }}>
            {getSaudacao()}
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>
          {nomeExibicao}, <span className="text-gradient">tudo em ordem?</span>
        </h1>
        <p className="text-sm" style={{ color: '#475569' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((item, i) => (
          <div key={i}
            className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden"
            style={{ borderColor: item.border }}>
            {/* Accent bar top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${item.accent}40, ${item.accent}10)` }} />

            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ background: item.bg }}>
                <item.icon size={16} style={{ color: item.accent }} />
              </div>
              {item.highlight && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-warning">
                  Atenção
                </span>
              )}
            </div>

            {loading
              ? <div className="skeleton h-8 w-16 rounded-lg mb-1" />
              : <p className="text-3xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.04em' }}>
                  {item.value}
                </p>
            }
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#475569' }}>{item.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#334155' }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid: Calendar + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

        {/* Calendar */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-5 sm:p-6 flex flex-col" style={{ minHeight: '480px' }}>
          <div className="flex-1 overflow-x-auto" style={{ minWidth: 0 }}>
            <div className="min-w-[500px] h-[420px]">
              <Calendar
                localizer={localizer}
                events={eventosCalendario}
                startAccessor="start" endAccessor="end" culture="pt-BR"
                date={dataCalendario} onNavigate={setDataCalendario}
                view={visualizacao} onView={setVisualizacao}
                components={{ toolbar: CustomToolbar }}
                style={{ height: '100%' }}
                eventPropGetter={eventPropGetter}
                messages={{ noEventsInRange: 'Nenhum prazo neste período.' }}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Próximos Prazos */}
          <div className="glass-card rounded-2xl p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
                <AlertCircle size={15} style={{ color: '#EF4444' }} />
                Próximos Prazos
              </h2>
              {displayTasks.length > 0 && (
                <span className="text-[10px] badge-warning px-2 py-0.5 rounded-full font-bold">
                  {displayTasks.length}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {displayTasks.length > 0 ? displayTasks.map(tarefa => {
                const p = priorityConfig[tarefa.prioridade] || priorityConfig.baixa;
                return (
                  <div key={tarefa.id}
                    className="p-3 rounded-xl border transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: '#CBD5E1' }}>
                        {tarefa.titulo}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0"
                        style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
                        {p.label}
                      </span>
                    </div>
                    <p className="text-[10px] flex items-center gap-1.5 font-medium" style={{ color: '#475569' }}>
                      <Clock size={10} />
                      {new Date(tarefa.data_vencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <CheckCircle size={24} style={{ color: '#10B981', opacity: 0.5 }} />
                  <p className="text-xs font-medium" style={{ color: '#334155' }}>Sem prazos próximos</p>
                </div>
              )}
            </div>
          </div>

          {/* CRM Stats */}
          <div className="glass-card rounded-2xl p-5 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#E2E8F0' }}>
                <MessageSquare size={15} style={{ color: '#10B981' }} />
                Triagem (CRM)
              </h2>
              <span className="text-[10px] badge-success px-2 py-0.5 rounded-full font-bold">
                {stats?.whatsapp?.total || 0} leads
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Aguardando', value: stats?.whatsapp?.novos || 0, color: '#EF4444', dot: true },
                { label: 'Em Atendimento', value: stats?.whatsapp?.em_atendimento || 0, color: '#F59E0B' },
                { label: 'Finalizados', value: stats?.whatsapp?.concluidos || 0, color: '#10B981' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs flex items-center gap-2" style={{ color: '#64748B' }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.color, boxShadow: row.dot ? `0 0 0 3px ${row.color}30` : 'none' }} />
                    {row.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: '#CBD5E1' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acesso Rápido */}
          <div className="glass-card rounded-2xl p-5 shrink-0">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#E2E8F0' }}>
              <Target size={15} style={{ color: '#7C3AED' }} />
              Acesso Rápido
            </h2>
            <div className="space-y-2">
              {[
                { to: '/clientes', icon: PlusCircle, label: 'Novo Cliente', color: '#3B82F6' },
                { to: '/processos', icon: Briefcase, label: 'Ver Processos', color: '#7C3AED' },
                { to: '/tarefas', icon: TrendingUp, label: 'Minhas Tarefas', color: '#10B981' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="flex items-center justify-between p-3 rounded-xl border transition-all group"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + '30'; e.currentTarget.style.background = item.color + '08'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg" style={{ background: item.color + '18' }}>
                      <item.icon size={14} style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{item.label}</span>
                  </div>
                  <ArrowRight size={13} style={{ color: '#334155' }} />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}