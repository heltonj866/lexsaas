import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, Briefcase, Scale, Clock, FileText, 
    User, AlertCircle, Calendar, Download, CheckCircle2, Loader2, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ProcessoDetalhes() {
    const { id } = useParams();
    const [processo, setProcesso] = useState(null);
    const [loading, setLoading] = useState(true);

    async function carregarProcesso() {
        try {
            const response = await api.get(`/processos/${id}`);
            setProcesso(response.data);
        } catch (error) {
            toast.error("Erro ao carregar detalhes do processo.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { carregarProcesso(); }, [id]);

    if (loading) return <div className="h-[calc(100vh-6rem)] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-indigo-500" /><span className="ml-3 text-slate-500 font-medium">A analisar processo...</span></div>;
    if (!processo) return <div className="h-[calc(100vh-6rem)] flex items-center justify-center text-slate-500">Processo não encontrado.</div>;

    const statusCores = {
        'Ativo': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
        'Suspenso': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
        'Arquivado': 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-10">
            
            {/* CABEÇALHO */}
            <div className="flex items-center gap-4">
                <Link to="/processos" className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 rounded-xl hover:shadow-sm transition-all active:scale-95 shrink-0">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{processo.numero_processo}</h1>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${statusCores[processo.status] || statusCores['Ativo']}`}>
                            {processo.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <Scale size={16} /> {processo.titulo || 'Sem título definido'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUNA ESQUERDA: INFORMAÇÕES PRINCIPAIS */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2"><Briefcase className="text-indigo-500" size={20}/> Dados Principais</h2>
                        
                        <div className="space-y-4">
                            
                            {/* CLIENTE VINCULADO */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Cliente Vinculado</span>
                                {processo.cliente ? (
                                    <Link to={`/clientes/${processo.cliente.id}`} className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:underline">
                                        <User size={16} /> {processo.cliente.nome}
                                    </Link>
                                ) : (
                                    <span className="text-slate-500 font-medium">Nenhum cliente associado</span>
                                )}
                            </div>

                            {/* 👇 ADICIONADO: BLOCO DE VALOR DA CAUSA 👇 */}
                            {processo.valor && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500/80 uppercase flex items-center gap-1 mb-1">
                                        <DollarSign size={14} /> Valor da Causa
                                    </span>
                                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                                        R$ {parseFloat(processo.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                            )}
                            
                            {/* OBSERVAÇÕES / RESUMO */}
                            <div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Observações / Resumo</span>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-300 min-h-[100px] whitespace-pre-wrap">
                                    {processo.descricao || 'Nenhuma anotação registada para este processo.'}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: PRAZOS E DOCUMENTOS */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* PRAZOS (TAREFAS) */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Clock className="text-amber-500" size={20}/> Prazos e Andamentos</h2>
                            <Link to="/tarefas" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                                + Novo Prazo
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {processo.tarefas && processo.tarefas.length > 0 ? (
                                processo.tarefas.map(tarefa => (
                                    <div key={tarefa.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 gap-3 group">
                                        <div className="flex items-start gap-3">
                                            {tarefa.status === 'concluido' ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} /> : <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />}
                                            <div>
                                                <h4 className={`font-bold text-sm ${tarefa.status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{tarefa.titulo}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold uppercase bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 border border-slate-200 dark:border-slate-700">{tarefa.status.replace('_', ' ')}</span>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${tarefa.prioridade === 'urgente' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{tarefa.prioridade}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                                            <Calendar size={14} /> {new Date(tarefa.data_vencimento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <Clock size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Nenhum prazo pendente para este processo.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DOCUMENTOS */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><FileText className="text-sky-500" size={20}/> Peças e Documentos</h2>
                            <Link to="/documentos" className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-3 py-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors">
                                Aceder Cofre
                            </Link>
                        </div>

                        {processo.documentos && processo.documentos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {processo.documentos.map(doc => (
                                    <div key={doc.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center group">
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{doc.titulo}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{doc.extensao} • {doc.tamanho_kb} KB</span>
                                        </div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-700 text-sky-600 rounded-xl shadow-sm hover:bg-sky-600 hover:text-white transition-all active:scale-95 shrink-0">
                                            <Download size={16} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Nenhum documento anexado a este processo.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}