import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, File, Image as ImageIcon, UploadCloud, Folder, ChevronRight, Search, Plus, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; 

export default function Documentos() {
    const [documentos, setDocumentos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [processos, setProcessos] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [busca, setBusca] = useState('');
    const [pastaAtiva, setPastaAtiva] = useState(null);

    // 👇 NOVO: Estado para a Modal de Exclusão de Documentos 👇
    const [documentoParaExcluir, setDocumentoParaExcluir] = useState(null);

    const [form, setForm] = useState({ titulo: '', cliente_id: '', processo_id: '', arquivo: null });

    // --- ESTILOS PREMIUM PADRONIZADOS ---
    const labelEstilo = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block transition-colors";
    const inputEstilo = "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all shadow-sm";

    async function carregarDados() {
        try {
            setLoading(true);
            const [resDocs, resClientes, resProcessos] = await Promise.all([
                api.get('/documentos'),
                api.get('/clientes'),
                api.get('/processos') 
            ]);

            setDocumentos(resDocs.data.data || resDocs.data); 
            setClientes(resClientes.data.data || resClientes.data);
            setProcessos(resProcessos.data.data || resProcessos.data); 
            
        } catch (error) { toast.error("Erro ao carregar o cofre de documentos."); } 
        finally { setLoading(false); }
    }

    useEffect(() => { carregarDados(); }, []);
    
    useEffect(() => { 
        if (isModalOpen && pastaAtiva) setForm(prev => ({ ...prev, cliente_id: pastaAtiva.id, processo_id: '' })); 
    }, [isModalOpen, pastaAtiva]);

    async function handleUpload(e) {
        e.preventDefault();
        if (!form.arquivo) return toast.error("Selecione um ficheiro para enviar.");
        
        setUploading(true);
        const toastId = toast.loading("A guardar documento no cofre seguro...");

        try {
            const formData = new FormData();
            formData.append('arquivo', form.arquivo);
            formData.append('titulo', form.arquivo.name);
            formData.append('cliente_id', form.cliente_id);
            if (form.processo_id) formData.append('processo_id', form.processo_id);

            await api.post('/documentos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            toast.success("Documento guardado com sucesso!", { id: toastId });
            fecharModal();
            carregarDados(); 
        } catch (error) { 
            toast.error(error.response?.data?.message || "Erro ao enviar ficheiro. Verifique o formato e o tamanho.", { id: toastId }); 
        } finally { setUploading(false); }
    }

    // 👇 NOVA FUNÇÃO: Confirmar a exclusão e disparar o Toast 👇
    async function confirmarExclusao() {
        if (!documentoParaExcluir) return;
        try {
            await api.delete(`/documentos/${documentoParaExcluir.id}`);
            toast.success("Documento removido."); 
            setDocumentoParaExcluir(null); // Fecha a modal
            carregarDados();
        } catch (error) { 
            toast.error(error.response?.data?.error || "Erro ao remover o documento."); 
        }
    }

    function fecharModal() { 
        setIsModalOpen(false); 
        setForm({ titulo: '', cliente_id: pastaAtiva ? pastaAtiva.id : '', processo_id: '', arquivo: null }); 
    }
    
    const renderIcone = (extensao) => {
        const ext = extensao?.toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <ImageIcon className="text-emerald-500 dark:text-emerald-400 transition-colors" size={32} />;
        if (['pdf'].includes(ext)) return <FileText className="text-rose-500 dark:text-rose-400 transition-colors" size={32} />;
        return <File className="text-sky-500 dark:text-sky-400 transition-colors" size={32} />;
    };

    const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));
    const documentosDaPasta = pastaAtiva ? documentos.filter(doc => doc.cliente_id === pastaAtiva.id) : [];
    const documentosFiltrados = documentosDaPasta.filter(doc => doc.titulo.toLowerCase().includes(busca.toLowerCase()));

    return (
        <div className="space-y-4 sm:space-y-6 flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-300 relative">
            
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Cofre de Documentos</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Gestão Eletrónica e Pastas de Clientes</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input type="text" placeholder={pastaAtiva ? `Buscar em ${pastaAtiva.nome}...` : "Buscar pasta..."} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 outline-none transition-all text-sm shadow-sm" value={busca} onChange={e => setBusca(e.target.value)} />
                    </div>
                    <button onClick={() => { !pastaAtiva ? toast("Entre numa pasta para fazer upload.", { icon: '📂' }) : setIsModalOpen(true); }} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white transition-all shadow-sm active:scale-95 whitespace-nowrap ${pastaAtiva ? 'bg-sky-600 hover:bg-sky-700 dark:hover:bg-sky-500' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'}`}>
                        <UploadCloud size={20} /> <span className="sm:inline">Enviar Ficheiro</span>
                    </button>
                </div>
            </div>

            {/* BREADCRUMBS */}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar shrink-0">
                <button onClick={() => { setPastaAtiva(null); setBusca(''); }} className={`font-bold flex items-center gap-2 transition-colors shrink-0 active:scale-95 text-sm ${!pastaAtiva ? 'text-sky-600 dark:text-sky-400 cursor-default' : 'hover:text-sky-600 dark:hover:text-sky-400'}`}>
                    <Folder size={18} className={!pastaAtiva ? "fill-sky-100 dark:fill-sky-900/40" : ""} /> Cofre Principal
                </button>
                {pastaAtiva && (
                    <>
                        <ChevronRight size={16} className="text-slate-400 dark:text-slate-600 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 whitespace-nowrap text-sm">
                            <Folder size={18} className="text-sky-500 dark:text-sky-400 fill-sky-100 dark:fill-sky-900/40 shrink-0" /> {pastaAtiva.nome}
                        </span>
                    </>
                )}
            </div>

            {/* ÁREA PRINCIPAL */}
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400"><Loader2 size={32} className="animate-spin text-sky-500" /><p>A carregar o cofre seguro...</p></div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-1">
                    
                    {!pastaAtiva && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-300">
                            <div onClick={() => toast("As pastas são criadas automaticamente ao adicionar novos clientes!", { icon: '💡' })} className="group bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all active:scale-95">
                                <div className="p-3.5 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl group-hover:text-sky-500 dark:group-hover:text-sky-400 shadow-sm transition-colors"><Plus size={24} /></div>
                                <div><h3 className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Nova Pasta</h3></div>
                            </div>
                            
                            {clientesFiltrados.map((cliente) => {
                                const qtdDocs = documentos.filter(d => d.cliente_id === cliente.id).length;
                                return (
                                    <div key={cliente.id} onClick={() => { setPastaAtiva(cliente); setBusca(''); }} className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-slate-600 transition-all cursor-pointer flex items-center gap-4 active:scale-95">
                                        <div className="p-3.5 bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                            <Folder size={28} className={qtdDocs > 0 ? "fill-sky-100 dark:fill-sky-800/40 group-hover:fill-sky-400" : ""} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate text-sm sm:text-base">{cliente.nome}</h3>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{qtdDocs} ficheiro(s)</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {pastaAtiva && (
                        <div className="animate-in slide-in-from-right-4 duration-300 h-full">
                            {documentosFiltrados.length === 0 ? (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm px-4">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-5 shadow-sm"><Folder size={40} className="text-slate-300 dark:text-slate-600" /></div>
                                    <h3 className="text-slate-800 dark:text-slate-200 font-bold text-xl mb-2">Pasta Vazia</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8">Nenhum documento guardado na pasta de {pastaAtiva.nome}.</p>
                                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-sky-600 text-white hover:bg-sky-700 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95">
                                        <UploadCloud size={20} /> Fazer Upload Seguro
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {documentosFiltrados.map((doc) => (
                                        <div key={doc.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group relative animate-in zoom-in-95">
                                            <div className="flex items-start justify-between mb-5">
                                                {renderIcone(doc.extensao)}
                                                <div className="flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors tooltip" title="Baixar/Ver"><Download size={18} /></a>
                                                    {/* 👇 Botão de exclusão agora abre a Modal 👇 */}
                                                    <button onClick={() => setDocumentoParaExcluir(doc)} className="p-2 bg-slate-50 dark:bg-slate-800 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors tooltip" title="Excluir permanentemente"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate mb-2" title={doc.titulo}>{doc.titulo}</h3>
                                            <p className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md inline-block text-slate-500 dark:text-slate-400">
                                                {doc.extensao?.toUpperCase()} • {doc.tamanho_kb > 1024 ? (doc.tamanho_kb / 1024).toFixed(2) + ' MB' : doc.tamanho_kb + ' KB'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE UPLOAD DE DOCUMENTOS */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><UploadCloud className="text-sky-600 dark:text-sky-400" /> Enviar Documento</h2>
                        </div>
                        
                        <div className="overflow-y-auto custom-scrollbar flex-1 p-5 sm:p-6">
                            <form id="form-upload" onSubmit={handleUpload} className="space-y-5 pb-4 px-1">
                                <div>
                                    <label className={labelEstilo}>Pasta de Destino</label>
                                    <select required disabled={!!pastaAtiva} className={`${inputEstilo} bg-slate-50 dark:bg-slate-800/50`} value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value, processo_id: '' })}>
                                        <option value="">Selecione o cliente...</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>

                                {/* DROPDOWN DE PROCESSOS AQUI */}
                                {form.cliente_id && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className={labelEstilo}>Vincular a Processo (Opcional)</label>
                                        <select className={`${inputEstilo} bg-slate-50 dark:bg-slate-800/50`} value={form.processo_id} onChange={e => setForm({ ...form, processo_id: e.target.value })}>
                                            <option value="">Nenhum processo específico...</option>
                                            {processos
                                                .filter(p => p.cliente_id == form.cliente_id) 
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>{p.numero_processo} - {p.titulo}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}

                                <div className="p-5 bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800/50 rounded-2xl">
                                    <label className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase mb-3 block text-center">Selecionar Ficheiro</label>
                                    <input id="arquivo-upload" type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                                        className="w-full text-sm text-slate-500 dark:text-slate-400 
                                        file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold 
                                        file:bg-sky-600 file:text-white dark:file:bg-sky-500 
                                        cursor-pointer hover:file:bg-sky-700 dark:hover:file:bg-sky-600 transition-colors" 
                                        onChange={e => setForm({ ...form, arquivo: e.target.files[0] })} 
                                    />
                                    <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">Aceita PDF, DOCX, JPG e PNG.</p>
                                </div>
                            </form>
                        </div>
                        
                        <div className="flex justify-end gap-3 p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-3xl shrink-0">
                            <button type="button" onClick={fecharModal} className="px-5 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95 text-sm">Cancelar</button>
                            <button type="submit" form="form-upload" disabled={uploading} className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 dark:hover:bg-sky-500 disabled:opacity-50 active:scale-95 transition-all shadow-md text-sm">
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : ''}
                                {uploading ? 'A Guardar...' : 'Salvar no Cofre'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 👇 MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE DOCUMENTO 👇 */}
            {documentoParaExcluir && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDocumentoParaExcluir(null)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                            <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Excluir Documento?</h3>
                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
                            Tem a certeza que deseja apagar o documento <span className="font-bold text-slate-700 dark:text-slate-300">{documentoParaExcluir.titulo}</span>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setDocumentoParaExcluir(null)} className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                                Cancelar
                            </button>
                            <button type="button" onClick={confirmarExclusao} className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md active:scale-95">
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}