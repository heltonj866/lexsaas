import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Briefcase, FileText, Download, Sparkles, Loader2, Plus, Search, X, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  const [resumosIA, setResumosIA] = useState({});
  const [loadingIA, setLoadingIA] = useState({});
  const [isProcessoModalOpen, setIsProcessoModalOpen] = useState(false);
  const [buscandoCnj, setBuscandoCnj] = useState(false);
  const [novoProcesso, setNovoProcesso] = useState({ titulo: '', numero_processo: '', tipo_acao: '', vara: '', status: 'Ativo' });

  async function carregarCliente() {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockData = {
      id: id, nome: id === '2' ? 'Construtora MG' : 'João Batista Júnior', cpf_cnpj: id === '2' ? '12.345.678/0001-99' : '111.222.333-44', telefone: id === '2' ? '(86) 3333-4444' : '(86) 99999-1111', email: id === '2' ? 'contato@mgconstrutora.com.br' : 'joao.batista@email.com',
      processos: [{ id: 1, numero_processo: '0001234-56.2026.8.18.0001', titulo: 'Ação Indenizatória', vara: '2ª Vara Cível de Teresina', tipo_acao: 'Indenização', status: 'Ativo' }],
      documentos: [{ id: 1, titulo: 'Contrato Social.pdf', extensao: 'pdf', tamanho_kb: 1450, url: '#' }]
    };
    setCliente(mockData); setLoading(false);
  }

  useEffect(() => { carregarCliente(); }, [id]);

  async function gerarResumoIA(processoId, dadosProcesso) {
    setLoadingIA(prev => ({ ...prev, [processoId]: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResumosIA(prev => ({ ...prev, [processoId]: `Com base na análise, o processo ${dadosProcesso.numero} trata-se de uma ação de ${dadosProcesso.tipo} na ${dadosProcesso.vara}. Probabilidade de êxito: Alta.` }));
    toast.success("Resumo gerado!");
    setLoadingIA(prev => ({ ...prev, [processoId]: false }));
  }

  async function buscarProcessoCNJ() {
    setBuscandoCnj(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setNovoProcesso(prev => ({ ...prev, tipo_acao: 'Ação Cível', vara: '1ª Vara Cível' }));
    toast.success("Dados encontrados!");
    setBuscandoCnj(false);
  }

  async function handleSalvarProcesso(e) {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 600));
    setCliente(prev => ({ ...prev, processos: [...prev.processos, { ...novoProcesso, id: Date.now() }] }));
    toast.success("Processo vinculado!");
    setIsProcessoModalOpen(false);
    setNovoProcesso({ titulo: '', numero_processo: '', tipo_acao: '', vara: '', status: 'Ativo' });
  }

  async function handleExcluirProcesso(processoId) {
    if (!window.confirm("Desvincular processo?")) return;
    setCliente(prev => ({ ...prev, processos: prev.processos.filter(p => p.id !== processoId) }));
    toast.success("Processo excluído!");
  }

  async function handleUploadDocumento(e) {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading("Enviando documento...");
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setCliente(prev => ({ ...prev, documentos: [...prev.documentos, { id: Date.now(), titulo: file.name, extensao: file.name.split('.').pop() || 'pdf', tamanho_kb: Math.round(file.size / 1024), url: '#' }] }));
    toast.success("Documento salvo!", { id: toastId });
  }

  async function handleExcluirDocumento(docId) {
    if (!window.confirm("Excluir documento?")) return;
    setCliente(prev => ({ ...prev, documentos: prev.documentos.filter(d => d.id !== docId) }));
    toast.success("Documento excluído!");
  }

  if (loading) return <div className="flex justify-center items-center h-full text-slate-500">A carregar ficha...</div>;
  if (!cliente) return null;

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 relative animate-in fade-in duration-300">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/clientes" className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm active:scale-95 shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div className="overflow-hidden">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{cliente.nome}</h1>
          <p className="text-xs sm:text-sm text-slate-500">Ficha do Cliente / Visão 360</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-10"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 sm:p-3.5 bg-sky-100 text-sky-600 rounded-2xl"><User size={24} /></div>
                <div><h2 className="font-bold text-slate-800">Dados Pessoais</h2><p className="text-xs text-slate-500">Contato principal</p></div>
              </div>
              <Link to="/clientes" className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors active:scale-95"><Edit size={18} /></Link>
            </div>
            <div className="space-y-4">
              <div className="border-b border-slate-50 pb-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase">CPF / CNPJ</label>
                <p className="font-medium text-slate-800 text-sm sm:text-base">{cliente.cpf_cnpj || '-'}</p>
              </div>
              <div className="border-b border-slate-50 pb-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Phone size={12}/> Telefone</label>
                <p className="font-medium text-slate-800 text-sm sm:text-base">{cliente.telefone || '-'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Mail size={12}/> E-mail</label>
                <p className="font-medium text-slate-800 text-sm sm:text-base truncate" title={cliente.email}>{cliente.email || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 sm:p-3.5 bg-indigo-100 text-indigo-600 rounded-2xl"><Briefcase size={24} /></div>
                <div><h2 className="font-bold text-slate-800">Processos Vinculados</h2><p className="text-xs text-slate-500">{cliente.processos?.length || 0} processo(s)</p></div>
              </div>
              <button onClick={() => setIsProcessoModalOpen(true)} className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 w-full sm:w-auto">
                <Plus size={18} /> Novo Processo
              </button>
            </div>

            {cliente.processos && cliente.processos.length > 0 ? (
              <div className="space-y-4">
                {cliente.processos.map(proc => (
                  <div key={proc.id} className="p-4 sm:p-5 border border-slate-100 rounded-2xl bg-slate-50 hover:shadow-sm transition-all group animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col xs:flex-row justify-between items-start gap-3 mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-white px-2 py-1 rounded-md border border-slate-200 mr-2 shadow-sm">{proc.status || 'Ativo'}</span>
                        <span className="text-sm sm:text-base font-bold text-slate-800 break-all">{proc.numero_processo}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full xs:w-auto justify-between xs:justify-end">
                        <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded-lg transition-colors active:scale-95"><Edit size={16} /></button>
                          <button onClick={() => handleExcluirProcesso(proc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors active:scale-95"><Trash2 size={16} /></button>
                        </div>
                        <button onClick={() => gerarResumoIA(proc.id, { numero: proc.numero_processo, tipo: proc.tipo_acao, vara: proc.vara })} disabled={loadingIA[proc.id]} className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-200 disabled:opacity-50 transition-colors active:scale-95 flex-1 xs:flex-none">
                          {loadingIA[proc.id] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          {resumosIA[proc.id] ? 'Atualizar' : 'Resumir IA'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 font-medium">{proc.titulo || proc.tipo_acao}</p>
                    <p className="text-xs text-slate-500 mt-1">{proc.vara}</p>
                    {resumosIA[proc.id] && (
                      <div className="mt-4 p-4 bg-white border-l-4 border-indigo-500 rounded-r-2xl shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 mb-2 text-indigo-600"><Sparkles size={16} /><span className="text-xs font-bold uppercase">Resumo Inteligente</span></div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{resumosIA[proc.id]}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl">
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm"><Briefcase size={28} className="text-indigo-400" /></div>
                <h3 className="text-slate-800 font-bold text-lg mb-2">Nenhum processo vinculado</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">Este cliente ainda não possui processos registados.</p>
              </div>
            )}
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 sm:p-3.5 bg-rose-100 text-rose-600 rounded-2xl"><FileText size={24} /></div>
                <div><h2 className="font-bold text-slate-800">Cofre de Documentos</h2><p className="text-xs text-slate-500">{cliente.documentos?.length || 0} arquivo(s)</p></div>
              </div>
              <label className="text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 w-full sm:w-auto">
                <Upload size={18} /> Anexar
                <input type="file" className="hidden" onChange={handleUploadDocumento} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>
            </div>

            {cliente.documentos && cliente.documentos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {cliente.documentos.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3.5 sm:p-4 border border-slate-200 rounded-2xl hover:shadow-md bg-slate-50 group animate-in fade-in zoom-in-95 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded-lg shadow-sm shrink-0"><FileText size={20} className="text-rose-500" /></div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-800 truncate">{doc.titulo}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium mt-0.5">{doc.extensao} • {doc.tamanho_kb} KB</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleExcluirDocumento(doc.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 active:scale-95"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl">
                <div className="w-14 h-14 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-3 shadow-sm"><FileText size={24} className="text-rose-400" /></div>
                <h3 className="text-slate-800 font-bold mb-1">Cofre Vazio</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-5">Ainda não foram anexados documentos.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isProcessoModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsProcessoModalOpen(false)}></div>
          <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100 shrink-0">
              <div><h2 className="text-xl font-bold text-slate-800">Vincular Processo</h2><p className="text-xs text-slate-500">Busca automática via DataJud</p></div>
              <button onClick={() => setIsProcessoModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"><X size={20} /></button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="form-processo" onSubmit={handleSalvarProcesso} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Título / Identificação interna</label>
                  <input type="text" required className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={novoProcesso.titulo} onChange={e => setNovoProcesso({...novoProcesso, titulo: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">NPU do Processo</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" required className="w-full border border-slate-300 rounded-xl p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={novoProcesso.numero_processo} onChange={e => setNovoProcesso({...novoProcesso, numero_processo: e.target.value})} />
                    <button type="button" onClick={buscarProcessoCNJ} disabled={buscandoCnj} className="bg-indigo-50 text-indigo-600 font-bold border border-indigo-200 px-5 py-3 rounded-xl hover:bg-indigo-100 flex justify-center items-center gap-2 transition-colors active:scale-95">
                      {buscandoCnj ? <Loader2 size={18} className="animate-spin" /> : <><Search size={18} /> Buscar</>}
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative mt-6">
                  <span className="absolute -top-3 left-4 bg-slate-50 px-2 text-[10px] font-bold text-slate-500 uppercase">Dados Oficiais</span>
                  <div className="space-y-4">
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Classe Judicial</label><input type="text" required className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={novoProcesso.tipo_acao} onChange={e => setNovoProcesso({...novoProcesso, tipo_acao: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Órgão Julgador / Vara</label><input type="text" required className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={novoProcesso.vara} onChange={e => setNovoProcesso({...novoProcesso, vara: e.target.value})} /></div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsProcessoModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors active:scale-95">Cancelar</button>
              <button type="submit" form="form-processo" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md active:scale-95">Salvar Processo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}