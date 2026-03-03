import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Users, FileText, Calendar as CalendarIcon, 
  TrendingUp, PlusCircle, Search, ArrowRight, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Importações do Calendário
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
        <button onClick={goToCurrent} className="px-4 py-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm active:scale-95">
          Hoje
        </button>
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-800">
          <button onClick={goToBack} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 border-r border-slate-200 dark:border-slate-700 transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={goToNext} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <span className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 capitalize text-center">{toolbar.label}</span>
      
      <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm w-full lg:w-auto overflow-x-auto custom-scrollbar">
        {toolbar.views.map(viewName => (
          <button key={viewName} onClick={() => toolbar.onView(viewName)} className={`flex-1 lg:flex-none px-4 py-2 text-sm font-bold capitalize transition-colors border-r last:border-r-0 border-slate-200 dark:border-slate-700 active:scale-95 ${toolbar.view === viewName ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
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
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setStats({
      totalClientes: 142, processosAtivos: 87, documentos: 1250, tarefasPendentes: 14,
      tarefas: [
        { id: 1, titulo: 'Audiência de Conciliação - Maria Silva', prioridade: 'urgente', data_vencimento: new Date().toISOString() },
        { id: 2, titulo: 'Protocolar Petição Inicial', prioridade: 'alta', data_vencimento: new Date(Date.now() + 86400000).toISOString() }, 
        { id: 3, titulo: 'Revisão de Contrato de Honorários', prioridade: 'media', data_vencimento: new Date(Date.now() + 172800000).toISOString() }
      ]
    });
    setLoading(false);
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
    let bgColor = '#6366f1'; 
    if (event.resource.prioridade === 'urgente') bgColor = '#e11d48'; 
    if (event.resource.prioridade === 'alta') bgColor = '#f59e0b'; 
    return { style: { backgroundColor: bgColor, borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 'bold', padding: '4px', color: '#ffffff' } };
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Bom dia, Advogado!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">O seu escritório em tempo real.</p>
      </div>

      {/* Cartões de Resumo responsivos */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, color: 'sky', label: 'Clientes', value: stats.totalClientes },
          { icon: Briefcase, color: 'indigo', label: 'Processos', value: stats.processosAtivos },
          { icon: FileText, color: 'rose', label: 'Cofre (GED)', value: stats.documentos }
        ].map((item, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            {/* Ícones com fundo transparente no dark mode para ficar elegante */}
            <div className={`p-3 sm:p-4 bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 rounded-xl shrink-0 transition-colors`}><item.icon size={24} /></div>
            <div className="overflow-hidden">
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate transition-colors">{item.label}</p>
              {loading ? <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div> : <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">{item.value}</h3>}
            </div>
          </div>
        ))}

        {/* Cartão de Tarefas Pendentes (Laranja) */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-orange-200 dark:border-orange-900/50 shadow-sm flex items-center gap-4 relative overflow-hidden hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-2 h-full bg-orange-500 dark:bg-orange-600"></div>
          <div className="p-3 sm:p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl shrink-0 transition-colors"><CalendarIcon size={24} /></div>
          <div className="overflow-hidden">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate transition-colors">Tarefas Pendentes</p>
            {loading ? <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-1"></div> : <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">{stats.tarefasPendentes}</h3>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bloco do Calendário */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[500px] h-[600px] overflow-hidden transition-all">
          <div className="flex-1 [&_.rbc-toolbar]:hidden overflow-x-auto custom-scrollbar">
            <div className="min-w-[600px] h-full"> 
              <Calendar
                localizer={localizer} events={eventosCalendario} startAccessor="start" endAccessor="end" culture="pt-BR"
                date={dataCalendario} onNavigate={setDataCalendario} view={visualizacao} onView={setVisualizacao}
                components={{ toolbar: CustomToolbar }} style={{ height: '100%' }}
                eventPropGetter={eventPropGetter} 
                // Adicionadas classes para suavizar as bordas e texto do calendário no modo escuro
                className="font-sans text-sm text-slate-700 dark:text-slate-300 [&_.rbc-month-view]:dark:border-slate-700 [&_.rbc-day-bg]:dark:border-slate-700 [&_.rbc-header]:dark:border-slate-700 [&_.rbc-off-range-bg]:dark:bg-slate-800/50"
                onSelectEvent={(event) => toast(`Compromisso: ${event.resource.titulo}`, { icon: 'ℹ️' })}
                messages={{ noEventsInRange: "Não há prazos neste período." }}
              />
            </div>
          </div>
        </div>

        {/* Bloco da Lateral Direita */}
        <div className="xl:col-span-1 space-y-6 flex flex-col h-auto xl:h-[600px]">
          
          {/* Urgentes & Próximos */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex-1 overflow-hidden flex flex-col transition-all">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 shrink-0 transition-colors">
              <AlertCircle size={20} className="text-rose-500" /> Urgentes & Próximos
            </h2>
            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
              {stats.tarefas?.map(tarefa => (
                  <div key={tarefa.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-2 transition-colors">{tarefa.titulo}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 transition-colors ${tarefa.prioridade === 'urgente' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {tarefa.prioridade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-2 transition-colors">
                      <CalendarIcon size={12} /> {new Date(tarefa.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 shrink-0 transition-all">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 transition-colors">
              <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" /> Ações Rápidas
            </h2>
            <div className="space-y-2">
              <Link to="/clientes" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-sm transition-all group active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm rounded-lg group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"><PlusCircle size={18} /></div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors">Novo Cliente</span>
                </div>
                <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
              </Link>
              <Link to="/processos" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all group active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm rounded-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"><Search size={18} /></div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors">Buscar Processo</span>
                </div>
                <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}