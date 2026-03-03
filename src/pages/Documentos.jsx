import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, File, Image as ImageIcon, UploadCloud, Folder, ChevronRight, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Documentos() {
    const [documentos, setDocumentos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [processos, setProcessos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [busca, setBusca] = useState('');
    const [pastaAtiva, setPastaAtiva] = useState(null);

    const [form, setForm] = useState({ titulo: '', cliente_id: '', processo_id: '', arquivo: null });

    // SIMULAÇÃO DE DADOS
    async function carregarDados() {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            const dadosClientes = [{ id: 1, nome: 'João Batista Júnior' }, { id: 2, nome: 'Construtora MG' }, { id: 3, nome: 'Clínica Veterinária São Francisco' }];
            const dadosDocs = [
              { id: 1, titulo: 'Contrato Social MG.pdf', cliente_id: 2, extensao: 'pdf', tamanho_kb: 2450, url: '#' },
              { id: 2, titulo: 'Procuração Assinada.pdf', cliente_id: 1, extensao: 'pdf', tamanho_kb: 320, url: '#' },
              { id: 3, titulo: 'Planta Arquitetônica.png', cliente_id: 3, extensao: 'png', tamanho_kb: 5120, url: '#' }
            ];
            setDocumentos(dadosDocs); setClientes(dadosClientes);
            setProcessos([{ id: 1, numero_processo: '0001234-56.2026.8.18.0001', cliente_id: 2 }]);
        } catch (error) { toast.error("Erro ao carregar o cofre."); } finally { setLoading(false); }
    }

    useEffect(() => { carregarDados(); }, []);
    useEffect(() => { if (isModalOpen && pastaAtiva) setForm(prev => ({ ...prev, cliente_id: pastaAtiva.id })); }, [isModalOpen, pastaAtiva]);

    async function handleUpload(e) {
        e.preventDefault();
        if (!form.arquivo) return toast.error("Selecione um arquivo para enviar.");
        setUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const novoDoc = { id: Date.now(), titulo: form.arquivo.name, cliente_id: Number(form.cliente_id), extensao: form.arquivo.name.split('.').pop() || 'pdf', tamanho_kb: Math.round(form.arquivo.size / 1024), url: '#' };
            setDocumentos(prev => [...prev, novoDoc]);
            toast.success("Documento guardado na pasta!");
            fecharModal();
        } catch (error) { toast.error("Erro ao enviar."); } finally { setUploading(false); }
    }

    function excluirDocumento(id) {
        if (window.confirm("Apagar o arquivo permanentemente?")) { setDocumentos(prev => prev.filter(d => d.id !== id)); toast.success("Documento removido."); }
    }

    function fecharModal() { setIsModalOpen(false); setForm({ titulo: '', cliente_id: pastaAtiva ? pastaAtiva.id : '', processo_id: '', arquivo: null }); }
    
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
        <div className="space-y-4 sm:space-y-6 flex flex-col h-full animate-in fade-in duration-300">
            
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Cofre de Documentos</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Gestão Eletrónica e Pastas de Clientes</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Campo de Busca adaptado para Dark Mode */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder={pastaAtiva ? `Buscar em ${pastaAtiva.nome}...` : "Buscar pasta..."} 
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 outline-none transition-all text-sm" 
                            value={busca} onChange={e => setBusca(e.target.value)} 
                        />
                    </div>
                    <button onClick={() => { !pastaAtiva ? toast("Entre numa pasta para fazer upload.", { icon: '📂' }) : setIsModalOpen(true); }} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white transition-all shadow-sm active:scale-95 whitespace-nowrap ${pastaAtiva ? 'bg-sky-600 hover:bg-sky-700 dark:hover:bg-sky-500' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'}`}>
                        <UploadCloud size={20} /> <span className="sm:inline">Enviar Ficheiro</span>
                    </button>
                </div>
            </div>

            {/* BARRA DE NAVEGAÇÃO (BREADCRUMBS) */}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar transition-colors duration-300">
                <button onClick={() => { setPastaAtiva(null); setBusca(''); }} className={`font-medium flex items-center gap-2 transition-colors shrink-0 active:scale-95 ${!pastaAtiva ? 'text-sky-600 dark:text-sky-400 cursor-default' : 'hover:text-sky-600 dark:hover:text-sky-400'}`}>
                    <Folder size={18} className={!pastaAtiva ? "fill-sky-100 dark:fill-sky-900/40" : ""} /> Início
                </button>
                {pastaAtiva && (
                    <>
                        <ChevronRight size={16} className="text-slate-400 dark:text-slate-600 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 whitespace-nowrap transition-colors">
                            <Folder size={18} className="text-sky-500 dark:text-sky-400 fill-sky-100 dark:fill-sky-900/40 shrink-0 transition-colors" /> {pastaAtiva.nome}
                        </span>
                    </>
                )}
            </div>

            {/* ÁREA PRINCIPAL (PASTAS OU ARQUIVOS) */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">A carregar o cofre seguro...</div>
            ) : (
                <div className="flex-1 pb-6">
                    
                    {/* VISÃO DE PASTAS */}
                    {!pastaAtiva && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                            {/* Botão Nova Pasta (Ghost) */}
                            <div onClick={() => toast("Pastas são geradas ao criar clientes!", { icon: '💡' })} className="group bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all active:scale-95">
                                <div className="p-3 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl group-hover:text-sky-500 dark:group-hover:text-sky-400 shadow-sm transition-colors"><Plus size={24} /></div>
                                <div><h3 className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Nova Pasta</h3></div>
                            </div>
                            
                            {/* Cartões de Pastas */}
                            {clientesFiltrados.map((cliente) => {
                                const qtdDocs = documentos.filter(d => d.cliente_id === cliente.id).length;
                                return (
                                    <div key={cliente.id} onClick={() => { setPastaAtiva(cliente); setBusca(''); }} className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-slate-600 transition-all cursor-pointer flex items-center gap-4 active:scale-95">
                                        <div className="p-3 bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400 rounded-xl group-hover:bg-sky-500 dark:group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                            <Folder size={28} className={qtdDocs > 0 ? "fill-sky-100 dark:fill-sky-800/40 group-hover:fill-sky-400" : ""} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate text-sm sm:text-base transition-colors" title={cliente.nome}>{cliente.nome}</h3>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">{qtdDocs} ficheiro(s)</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* VISÃO DE DOCUMENTOS DENTRO DA PASTA */}
                    {pastaAtiva && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            {documentosFiltrados.length === 0 ? (
                                /* Estado Vazio Suavizado no Dark Mode */
                                <div className="py-16 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 px-4 transition-colors">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors"><Folder size={32} className="text-slate-300 dark:text-slate-600" /></div>
                                    <h3 className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1 transition-colors">Pasta Vazia</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6 transition-colors">Nenhum documento guardado na pasta de {pastaAtiva.nome}.</p>
                                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/60 px-6 py-3 rounded-xl font-bold transition-all active:scale-95">
                                        <UploadCloud size={18} /> Fazer Upload
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {/* Cartões de Documentos */}
                                    {documentosFiltrados.map((doc) => (
                                        <div key={doc.id} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group relative">
                                            <div className="flex items-start justify-between mb-4">
                                                {renderIcone(doc.extensao)}
                                                
                                                {/* Botões de Ação do Documento */}
                                                <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <a href="#" className="p-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/50 active:scale-95 transition-colors"><Download size={16} /></a>
                                                    <button onClick={() => excluirDocumento(doc.id)} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate mb-1 transition-colors" title={doc.titulo}>{doc.titulo}</h3>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 transition-colors">
                                                <p className="mt-2 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block text-slate-600 dark:text-slate-300 transition-colors">
                                                    {doc.extensao.toUpperCase()} • {doc.tamanho_kb > 1024 ? (doc.tamanho_kb / 1024).toFixed(2) + ' MB' : doc.tamanho_kb + ' KB'}
                                                </p>
                                            </div>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={fecharModal}></div>
                    
                    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 shrink-0 transition-colors"><UploadCloud className="text-sky-600 dark:text-sky-400" /> Enviar para Pasta</h2>
                        
                        <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                            <form id="form-upload" onSubmit={handleUpload} className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block transition-colors">Pasta de Destino</label>
                                    <select required disabled={!!pastaAtiva} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 outline-none transition-colors" value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                                        <option value="">Selecione o cliente...</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block transition-colors">Selecionar Ficheiro</label>
                                    
                                    {/* Input File estilizado para Dark Mode */}
                                    <input id="arquivo-upload" type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                                        className="w-full text-sm text-slate-500 dark:text-slate-400 
                                        file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold 
                                        file:bg-sky-50 file:text-sky-700 dark:file:bg-sky-900/30 dark:file:text-sky-400 
                                        cursor-pointer hover:file:bg-sky-100 dark:hover:file:bg-sky-900/50 transition-colors" 
                                        onChange={e => setForm({ ...form, arquivo: e.target.files[0] })} 
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 shrink-0 transition-colors">
                            <button type="button" onClick={fecharModal} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition-colors active:scale-95">Cancelar</button>
                            <button type="submit" form="form-upload" disabled={uploading} className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 dark:hover:bg-sky-500 disabled:opacity-50 active:scale-95 transition-all shadow-sm">
                                {uploading ? 'A Guardar...' : 'Salvar no Cofre'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}