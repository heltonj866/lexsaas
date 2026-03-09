import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Users, FileText, Calendar as CalendarIcon, 
  TrendingUp, PlusCircle, Search, ArrowRight, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; 

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
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  const translateView = (view) => {
    const views = { month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' };
    return views[view] || view;
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
      <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-start">
        <button onClick={goToCurrent} className="px-4 py-2.5 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm active:scale-95">
          Hoje
        </button>
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-800">
          <button onClick={goToBack} className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 border-r border-slate-200 dark:border-slate-700 transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={goToNext} className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 capitalize text-center">{toolbar.label}</span>
      
      <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm w-full lg:w-auto overflow-x-auto custom-scrollbar">
        {toolbar.views.map(viewName => (
          <button key={viewName} onClick={() => toolbar.onView(viewName)} className={`flex-1 lg:flex-none px-4 py-2.5 text-sm font-bold capitalize transition-colors border-r last:border-r-0 border-slate-200 dark:border-slate-700 active:scale-95 ${toolbar.view === viewName ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
            {translateView(viewName)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalClientes: 0, processosAtivos: 0, documentos: 0, tarefasPendentes: 0, tarefas: [] });
  const [dataCalendario, setDataCalendario] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState('month');

  async function carregarMetricas() {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error("Não foi possível carregar os dados atualizados.");
      setStats({ totalClientes: 0, processosAtivos: 0, documentos: 0, tarefasPendentes: 0, tarefas: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarMetricas(); }, []);

  const eventosCalendario = (stats.tarefas || []).map(tarefa => {
    const dataVencimento = new Date(tarefa.data_vencimento);
    return {
      id: tarefa.id, title: `${tarefa.prioridade === 'urgente' ? '🚨 ' : ''}${tarefa.titulo}`,
      start: dataVencimento, end: dataVencimento, resource: tarefa
    };
  });

  const eventPropGetter = (event) => {
    let bgColor = '#6366f1'; // Indigo (Média/Baixa)
    if (event.resource.prioridade === 'urgente') bgColor = '#e11d48'; // Rose
    if (event.resource.prioridade === 'alta') bgColor = '#f59e0b'; // Amber
    return { style: { backgroundColor: bgColor, borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: 'bold', padding: '4px 6px', color: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' } };
  };

  // Correção do Bug do Tailwind: Classes inteiras mapeadas
  const resumoCards = [
    { icon: Users, label: 'Clientes Ativos', value: stats.totalClientes, colorClass: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' },
    { icon: Briefcase, label: 'Processos', value: stats.processosAtivos, colorClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
    { icon: FileText, label: 'Cofre (GED)', value: stats.documentos, colorClass: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Bom dia, Advogado!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Visão geral do seu escritório em tempo real.</p>
      </div>

      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {resumoCards.map((item, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3.5 rounded-2xl shrink-0 transition-colors ${item.colorClass}`}><item.icon size={24} /></div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate mb-1">{item.label}</p>
              {loading ? <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div> : <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">{item.value}</h3>}
            </div>
          </div>
        ))}

        {/* Cartão de Tarefas (Laranja) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-orange-200 dark:border-orange-900/50 shadow-sm flex items-center gap-4 relative overflow-hidden hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-2 h-full bg-orange-500 dark:bg-orange-600"></div>
          <div className="p-3.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl shrink-0"><CalendarIcon size={24} /></div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate mb-1">Pendências</p>
            {loading ? <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div> : <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">{stats.tarefasPendentes}</h3>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 h-auto xl:h-[650px]">
        {/* Bloco do Calendário */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[500px] xl:h-full overflow-hidden transition-all">
          <div className="flex-1 [&_.rbc-toolbar]:hidden overflow-x-auto custom-scrollbar">
            <div className="min-w-[600px] h-full"> 
              <Calendar
                localizer={localizer} events={eventosCalendario} startAccessor="start" endAccessor="end" culture="pt-BR"
                date={dataCalendario} onNavigate={setDataCalendario} view={visualizacao} onView={setVisualizacao}
                components={{ toolbar: CustomToolbar }} style={{ height: '100%' }} eventPropGetter={eventPropGetter} 
                className="font-sans text-sm text-slate-700 dark:text-slate-300 [&_.rbc-month-view]:dark:border-slate-700 [&_.rbc-day-bg]:dark:border-slate-700 [&_.rbc-header]:dark:border-slate-700 [&_.rbc-off-range-bg]:dark:bg-slate-800/50"
                messages={{ noEventsInRange: "Não há prazos neste período." }}
              />
            </div>
          </div>
        </div>

        {/* Bloco da Lateral Direita */}
        <div className="xl:col-span-1 flex flex-col gap-6 sm:gap-8 h-auto xl:h-full">
          
          {/* Urgentes & Próximos */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex-1 flex flex-col overflow-hidden transition-all">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-5 shrink-0">
              <AlertCircle size={22} className="text-rose-500" /> Próximos Prazos
            </h2>
            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {stats.tarefas?.length > 0 ? stats.tarefas.map(tarefa => (
                <div key={tarefa.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-2">{tarefa.titulo}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase shrink-0 ${tarefa.prioridade === 'urgente' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {tarefa.prioridade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <CalendarIcon size={14} /> {new Date(tarefa.data_vencimento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-2">
                  <CalendarIcon size={32} className="opacity-50" />
                  <p className="text-sm font-medium">Nenhum prazo próximo.</p>
                </div>
              )}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 shrink-0 transition-all">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-5">
              <TrendingUp size={22} className="text-indigo-600 dark:text-indigo-400" /> Acesso Rápido
            </h2>
            <div className="space-y-3">
              <Link to="/clientes" className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-sm transition-all group active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors"><PlusCircle size={18} /></div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Adicionar Cliente</span>
                </div>
                <ArrowRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-sky-600 transition-colors" />
              </Link>
              <Link to="/processos" className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Search size={18} /></div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Buscar Processo</span>
                </div>
                <ArrowRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 transition-colors" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}