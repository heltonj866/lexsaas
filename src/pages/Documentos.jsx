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
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <ImageIcon className="text-emerald-500" size={32} />;
        if (['pdf'].includes(ext)) return <FileText className="text-rose-500" size={32} />;
        return <File className="text-sky-500" size={32} />;
    };

    const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));
    const documentosDaPasta = pastaAtiva ? documentos.filter(doc => doc.cliente_id === pastaAtiva.id) : [];
    const documentosFiltrados = documentosDaPasta.filter(doc => doc.titulo.toLowerCase().includes(busca.toLowerCase()));

    return (
        <div className="space-y-4 sm:space-y-6 flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Cofre de Documentos</h1>
                    <p className="text-sm text-slate-500">Gestão Eletrónica e Pastas de Clientes</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder={pastaAtiva ? `Buscar em ${pastaAtiva.nome}...` : "Buscar pasta..."} className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none transition-shadow text-sm" value={busca} onChange={e => setBusca(e.target.value)} />
                    </div>
                    <button onClick={() => { !pastaAtiva ? toast("Entre numa pasta para fazer upload.", { icon: '📂' }) : setIsModalOpen(true); }} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white transition-all shadow-sm active:scale-95 whitespace-nowrap ${pastaAtiva ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-800 hover:bg-slate-900'}`}>
                        <UploadCloud size={20} /> <span className="sm:inline">Enviar Ficheiro</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm w-full sm:w-fit overflow-x-auto custom-scrollbar">
                <button onClick={() => { setPastaAtiva(null); setBusca(''); }} className={`font-medium flex items-center gap-2 transition-colors shrink-0 active:scale-95 ${!pastaAtiva ? 'text-sky-600 cursor-default' : 'hover:text-sky-600'}`}>
                    <Folder size={18} className={!pastaAtiva ? "fill-sky-100" : ""} /> Início
                </button>
                {pastaAtiva && (
                    <>
                        <ChevronRight size={16} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                            <Folder size={18} className="text-sky-500 fill-sky-100 shrink-0" /> {pastaAtiva.nome}
                        </span>
                    </>
                )}
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">A carregar o cofre seguro...</div>
            ) : (
                <div className="flex-1 pb-6">
                    {!pastaAtiva && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                            <div onClick={() => toast("Pastas são geradas ao criar clientes!", { icon: '💡' })} className="group bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all active:scale-95">
                                <div className="p-3 bg-white text-slate-400 rounded-xl group-hover:text-sky-500 shadow-sm"><Plus size={24} /></div>
                                <div><h3 className="font-bold text-slate-600 group-hover:text-sky-600">Nova Pasta</h3></div>
                            </div>
                            {clientesFiltrados.map((cliente) => {
                                const qtdDocs = documentos.filter(d => d.cliente_id === cliente.id).length;
                                return (
                                    <div key={cliente.id} onClick={() => { setPastaAtiva(cliente); setBusca(''); }} className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center gap-4 active:scale-95">
                                        <div className="p-3 bg-sky-50 text-sky-500 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                            <Folder size={28} className={qtdDocs > 0 ? "fill-sky-100" : ""} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-bold text-slate-800 truncate text-sm sm:text-base" title={cliente.nome}>{cliente.nome}</h3>
                                            <p className="text-xs font-medium text-slate-500">{qtdDocs} ficheiro(s)</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {pastaAtiva && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            {documentosFiltrados.length === 0 ? (
                                <div className="py-16 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 px-4">
                                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm"><Folder size={32} className="text-slate-300" /></div>
                                    <h3 className="text-slate-800 font-bold text-lg mb-1">Pasta Vazia</h3>
                                    <p className="text-slate-500 text-sm max-w-sm mb-6">Nenhum documento guardado na pasta de {pastaAtiva.nome}.</p>
                                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-sky-100 text-sky-700 hover:bg-sky-200 px-6 py-3 rounded-xl font-bold transition-all active:scale-95">
                                        <UploadCloud size={18} /> Fazer Upload
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {documentosFiltrados.map((doc) => (
                                        <div key={doc.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group relative">
                                            <div className="flex items-start justify-between mb-4">
                                                {renderIcone(doc.extensao)}
                                                <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <a href="#" className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 active:scale-95"><Download size={16} /></a>
                                                    <button onClick={() => excluirDocumento(doc.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:scale-95"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-sm truncate mb-1" title={doc.titulo}>{doc.titulo}</h3>
                                            <div className="text-xs text-slate-500 space-y-1">
                                                <p className="mt-2 text-[10px] font-mono font-bold bg-slate-100 px-2 py-1 rounded inline-block text-slate-600">
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

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={fecharModal}></div>
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 shrink-0"><UploadCloud className="text-sky-600" /> Enviar para Pasta</h2>
                        <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                            <form id="form-upload" onSubmit={handleUpload} className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Pasta de Destino</label>
                                    <select required disabled={!!pastaAtiva} className="w-full rounded-xl border border-slate-300 p-3 bg-slate-50 font-medium text-slate-700 outline-none" value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                                        <option value="">Selecione o cliente...</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Selecionar Ficheiro</label>
                                    <input id="arquivo-upload" type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 cursor-pointer hover:file:bg-sky-100 transition-colors" onChange={e => setForm({ ...form, arquivo: e.target.files[0] })} />
                                </div>
                            </form>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-5 shrink-0">
                            <button type="button" onClick={fecharModal} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors active:scale-95">Cancelar</button>
                            <button type="submit" form="form-upload" disabled={uploading} className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 disabled:opacity-50 active:scale-95 transition-all shadow-sm">
                                {uploading ? 'A Guardar...' : 'Salvar no Cofre'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}