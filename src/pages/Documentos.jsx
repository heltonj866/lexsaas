import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, File, Image as ImageIcon, UploadCloud, Folder, ChevronRight, Search, Plus, Loader2, AlertTriangle, X } from 'lucide-react';
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

export default function Documentos() {
    const [documentos, setDocumentos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [processos, setProcessos] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [busca, setBusca] = useState('');
    const [pastaAtiva, setPastaAtiva] = useState(null);

    const [documentoParaExcluir, setDocumentoParaExcluir] = useState(null);
    const [form, setForm] = useState({ titulo: '', cliente_id: '', processo_id: '', arquivo: null });

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
        } catch { toast.error("Erro ao carregar o cofre de documentos."); } 
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

    async function confirmarExclusao() {
        if (!documentoParaExcluir) return;
        try {
            await api.delete(`/documentos/${documentoParaExcluir.id}`);
            toast.success("Documento removido."); 
            setDocumentoParaExcluir(null);
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
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <ImageIcon style={{ color: '#10B981' }} size={28} />;
        if (['pdf'].includes(ext)) return <FileText style={{ color: '#EF4444' }} size={28} />;
        return <File style={{ color: '#3B82F6' }} size={28} />;
    };

    const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));
    const documentosDaPasta = pastaAtiva ? documentos.filter(doc => doc.cliente_id === pastaAtiva.id) : [];
    const documentosFiltrados = documentosDaPasta.filter(doc => doc.titulo.toLowerCase().includes(busca.toLowerCase()));

    return (
        <div className="space-y-5 animate-enter pb-8">
            
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>Cofre de Documentos</h1>
                    <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Gestão Eletrónica e Pastas de Clientes</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
                        <input type="text" placeholder={pastaAtiva ? `Buscar em ${pastaAtiva.nome}...` : "Buscar pasta..."} 
                            className="pl-9 pr-4 py-2 text-sm rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#CBD5E1', outline: 'none', width: '220px' }}
                            value={busca} onChange={e => setBusca(e.target.value)} 
                        />
                    </div>
                    <button onClick={() => { !pastaAtiva ? toast("Entre numa pasta para fazer upload.", { icon: '📂', style: { background: '#131929', color: '#F1F5F9', border: '1px solid #1E293B' } }) : setIsModalOpen(true); }} 
                        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
                        <UploadCloud size={16} /> <span className="hidden sm:inline">Enviar Ficheiro</span>
                    </button>
                </div>
            </div>

            {/* BREADCRUMBS */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-full sm:w-fit"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => { setPastaAtiva(null); setBusca(''); }} 
                    className="flex items-center gap-2 text-xs font-bold transition-colors"
                    style={{ color: !pastaAtiva ? '#F59E0B' : '#64748B' }}
                    onMouseEnter={e => { if(pastaAtiva) e.currentTarget.style.color = '#F59E0B'; }}
                    onMouseLeave={e => { if(pastaAtiva) e.currentTarget.style.color = '#64748B'; }}>
                    <Folder size={14} style={{ fill: !pastaAtiva ? 'rgba(245,158,11,0.2)' : 'none' }} /> Cofre Principal
                </button>
                {pastaAtiva && (
                    <>
                        <ChevronRight size={14} style={{ color: '#334155' }} />
                        <span className="flex items-center gap-2 text-xs font-bold" style={{ color: '#F59E0B' }}>
                            <Folder size={14} style={{ fill: 'rgba(245,158,11,0.2)' }} /> {pastaAtiva.nome}
                        </span>
                    </>
                )}
            </div>

            {/* ÁREA PRINCIPAL */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 size={24} className="animate-spin" style={{ color: '#F59E0B' }} />
                </div>
            ) : (
                <div className="flex-1 pb-6">
                    {!pastaAtiva && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div onClick={() => toast("As pastas são criadas automaticamente ao adicionar novos clientes!", { icon: '💡', style: { background: '#131929', color: '#F1F5F9', border: '1px solid #1E293B' } })} 
                                className="group p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all"
                                style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                                <div className="p-3 rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <Plus size={20} style={{ color: '#64748B' }} />
                                </div>
                                <div><h3 className="font-bold text-sm" style={{ color: '#94A3B8' }}>Nova Pasta</h3></div>
                            </div>
                            
                            {clientesFiltrados.map((cliente) => {
                                const qtdDocs = documentos.filter(d => d.cliente_id === cliente.id).length;
                                return (
                                    <div key={cliente.id} onClick={() => { setPastaAtiva(cliente); setBusca(''); }} 
                                        className="group p-5 rounded-2xl cursor-pointer flex items-center gap-4 transition-all"
                                        style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.04)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#131929'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                                        <div className="p-3 rounded-xl transition-colors" style={{ background: 'rgba(245,158,11,0.1)' }}>
                                            <Folder size={24} style={{ color: '#F59E0B', fill: qtdDocs > 0 ? 'rgba(245,158,11,0.2)' : 'none' }} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-bold text-sm truncate" style={{ color: '#E2E8F0' }}>{cliente.nome}</h3>
                                            <p className="text-[10px] font-medium" style={{ color: '#64748B' }}>{qtdDocs} ficheiro(s)</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {pastaAtiva && (
                        <div className="animate-enter h-full">
                            {documentosFiltrados.length === 0 ? (
                                <div className="py-16 flex flex-col items-center justify-center text-center rounded-3xl"
                                     style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                         style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Folder size={32} style={{ color: '#334155' }} />
                                    </div>
                                    <h3 className="font-bold text-base mb-1" style={{ color: '#F1F5F9' }}>Pasta Vazia</h3>
                                    <p className="text-xs mb-6 max-w-sm" style={{ color: '#64748B' }}>Nenhum documento guardado na pasta de {pastaAtiva.nome}.</p>
                                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                                        <UploadCloud size={16} /> Fazer Upload Seguro
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {documentosFiltrados.map((doc) => (
                                        <div key={doc.id} className="p-5 rounded-2xl transition-all group relative animate-enter"
                                             style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.04)' }}
                                             onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                             onMouseLeave={e => { e.currentTarget.style.background = '#131929'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                    {renderIcone(doc.extensao)}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg transition-colors"
                                                       style={{ color: '#475569' }}
                                                       onMouseEnter={e => { e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; }}
                                                       onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}>
                                                        <Download size={14} />
                                                    </a>
                                                    <button onClick={() => setDocumentoParaExcluir(doc)} className="p-1.5 rounded-lg transition-colors"
                                                       style={{ color: '#475569' }}
                                                       onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                                       onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-sm truncate mb-2" style={{ color: '#E2E8F0' }} title={doc.titulo}>{doc.titulo}</h3>
                                            <p className="text-[9px] font-mono font-bold px-2 py-1 rounded inline-block"
                                               style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>
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

            {/* MODAL DE UPLOAD */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={fecharModal} />
                    <div className="relative w-full sm:max-w-md flex flex-col max-h-[92vh] animate-enter"
                         style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px' }}>
                        
                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                             style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center gap-2">
                                <UploadCloud size={16} style={{ color: '#F59E0B' }} />
                                <h2 className="text-base font-bold" style={{ color: '#F1F5F9' }}>Enviar Documento</h2>
                            </div>
                            <button onClick={fecharModal} className="p-1.5 rounded-lg" style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}>
                                <X size={15} />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 p-5">
                            <form id="form-upload" onSubmit={handleUpload} className="space-y-4">
                                <FormField label="Pasta de Destino">
                                    <select required disabled={!!pastaAtiva} style={{ ...getInputStyle(), opacity: pastaAtiva ? 0.5 : 1 }} 
                                            value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value, processo_id: '' })}
                                            onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                                        <option value="">Selecione o cliente...</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </FormField>

                                {form.cliente_id && (
                                    <div className="animate-enter">
                                        <FormField label="Vincular a Processo (Opcional)">
                                            <select style={getInputStyle()} value={form.processo_id} onChange={e => setForm({ ...form, processo_id: e.target.value })}
                                                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
                                                <option value="">Nenhum processo específico...</option>
                                                {processos.filter(p => p.cliente_id == form.cliente_id).map(p => (
                                                    <option key={p.id} value={p.id}>{p.numero_processo} - {p.titulo}</option>
                                                ))}
                                            </select>
                                        </FormField>
                                    </div>
                                )}

                                <div className="p-4 rounded-xl border-dashed"
                                     style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <label className="text-xs font-bold uppercase mb-3 block text-center" style={{ color: '#94A3B8' }}>Selecionar Ficheiro</label>
                                    <input id="arquivo-upload" type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                                        className="w-full text-xs" 
                                        style={{ color: '#64748B' }}
                                        onChange={e => setForm({ ...form, arquivo: e.target.files[0] })} 
                                    />
                                    <p className="text-[10px] text-center mt-3 font-medium" style={{ color: '#475569' }}>Aceita PDF, DOCX, JPG e PNG.</p>
                                </div>
                            </form>
                        </div>
                        
                        <div className="px-5 py-4 flex gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                            <button type="button" onClick={fecharModal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
                            <button type="submit" form="form-upload" disabled={uploading} className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary disabled:opacity-50">
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : ''}
                                {uploading ? 'A Guardar...' : 'Salvar no Cofre'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EXCLUSÃO */}
            {documentoParaExcluir && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDocumentoParaExcluir(null)} />
                    <div className="relative rounded-2xl p-6 max-w-sm w-full animate-enter"
                         style={{ background: '#131929', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.10)' }}>
                            <AlertTriangle size={22} style={{ color: '#EF4444' }} />
                        </div>
                        <h3 className="text-base font-bold text-center mb-1" style={{ color: '#F1F5F9' }}>Excluir Documento?</h3>
                        <p className="text-center text-xs mb-6" style={{ color: '#475569' }}>
                            <span className="font-semibold" style={{ color: '#CBD5E1' }}>{documentoParaExcluir.titulo}</span> será removido permanentemente.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDocumentoParaExcluir(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost">Cancelar</button>
                            <button onClick={confirmarExclusao} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-danger">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}