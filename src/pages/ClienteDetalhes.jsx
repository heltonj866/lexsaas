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

  // 👇 MODO APRESENTAÇÃO: FICHA DO CLIENTE FAKE COMPLETA 👇
  async function carregarCliente() {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Geramos a ficha perfeita para a demonstração
    const mockData = {
      id: id,
      nome: id === '2' ? 'Construtora MG' : 'João Batista Júnior',
      cpf_cnpj: id === '2' ? '12.345.678/0001-99' : '111.222.333-44',
      telefone: id === '2' ? '(86) 3333-4444' : '(86) 99999-1111',
      email: id === '2' ? 'contato@mgconstrutora.com.br' : 'joao.batista@email.com',
      processos: [
        { id: 1, numero_processo: '0001234-56.2026.8.18.0001', titulo: 'Ação Indenizatória', vara: '2ª Vara Cível de Teresina', tipo_acao: 'Indenização', status: 'Ativo' }
      ],
      documentos: [
        { id: 1, titulo: 'Contrato Social.pdf', extensao: 'pdf', tamanho_kb: 1450, url: '#' },
        { id: 2, titulo: 'Procuração Assinada.pdf', extensao: 'pdf', tamanho_kb: 420, url: '#' }
      ]
    };
    
    setCliente(mockData);
    setLoading(false);
  }

  useEffect(() => { carregarCliente(); }, [id]);

  // 👇 MODO APRESENTAÇÃO: SIMULAÇÃO DA IA GERANDO TEXTO 👇
  async function gerarResumoIA(processoId, dadosProcesso) {
    setLoadingIA(prev => ({ ...prev, [processoId]: true }));
    
    // Simula a IA a "pensar" durante 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const textoGerado = `Com base na análise dos metadados, o processo ${dadosProcesso.numero} trata-se de uma ação de ${dadosProcesso.tipo} protocolada na ${dadosProcesso.vara}. O último andamento indica que está em fase de citação do réu. Probabilidade de êxito: Alta.`;
    
    setResumosIA(prev => ({ ...prev, [processoId]: textoGerado }));
    toast.success("Resumo jurídico gerado pela LexIA!");
    setLoadingIA(prev => ({ ...prev, [processoId]: false }));
  }

  async function buscarProcessoCNJ() {
    const npuLimpo = novoProcesso.numero_processo.replace(/\D/g, '');
    if (npuLimpo.length !== 20) return toast.error("Digite os 20 números do processo.");

    setBuscandoCnj(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setNovoProcesso(prev => ({ ...prev, tipo_acao: 'Ação Cível', vara: '1ª Vara Cível' }));
    toast.success("Dados encontrados no CNJ!");
    setBuscandoCnj(false);
  }

  // 👇 MODO APRESENTAÇÃO: ADICIONA O PROCESSO VISUALMENTE NA TELA 👇
  async function handleSalvarProcesso(e) {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Atualiza a tela na hora para o cliente ver o novo cartão aparecer
    setCliente(prev => ({
      ...prev,
      processos: [...prev.processos, { ...novoProcesso, id: Date.now() }]
    }));
    
    toast.success("Processo vinculado com sucesso!");
    setIsProcessoModalOpen(false);
    setNovoProcesso({ titulo: '', numero_processo: '', tipo_acao: '', vara: '', status: 'Ativo' });
  }

  async function handleExcluirProcesso(processoId) {
    if (!window.confirm("Tem certeza que deseja desvincular e excluir este processo?")) return;
    setCliente(prev => ({ ...prev, processos: prev.processos.filter(p => p.id !== processoId) }));
    toast.success("Processo excluído!");
  }

  // 👇 MODO APRESENTAÇÃO: ADICIONA O DOCUMENTO VISUALMENTE NO COFRE 👇
  async function handleUploadDocumento(e) {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Criptografando e enviando documento...");
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Tempo de upload fake
    
    // Adiciona o documento na tela para efeito "UAU" na apresentação
    setCliente(prev => ({
      ...prev,
      documentos: [...prev.documentos, {
        id: Date.now(),
        titulo: file.name,
        extensao: file.name.split('.').pop() || 'pdf',
        tamanho_kb: Math.round(file.size / 1024),
        url: '#'
      }]
    }));

    toast.success("Documento salvo no cofre!", { id: toastId });
  }

  async function handleExcluirDocumento(docId) {
    if (!window.confirm("Excluir este documento do cofre?")) return;
    setCliente(prev => ({ ...prev, documentos: prev.documentos.filter(d => d.id !== docId) }));
    toast.success("Documento excluído!");
  }

  if (loading) return <div className="flex justify-center items-center h-full text-slate-500">A carregar ficha do cliente...</div>;
  if (!cliente) return null;

  return (
    <div className="space-y-6 pb-10 relative">
      <div className="flex items-center gap-4">
        <Link to="/clientes" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{cliente.nome}</h1>
          <p className="text-sm text-slate-500">Ficha do Cliente / Visão 360</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: DADOS PESSOAIS */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-10"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-100 text-sky-600 rounded-xl"><User size={24} /></div>
                <div><h2 className="font-bold text-slate-800">Dados Pessoais</h2><p className="text-xs text-slate-500">Contato principal</p></div>
              </div>
              <Link to="/clientes" className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"><Edit size={18} /></Link>
            </div>
            <div className="space-y-4">
              <div className="border-b border-slate-50 pb-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase">CPF / CNPJ</label>
                <p className="font-medium text-slate-800">{cliente.cpf_cnpj || '-'}</p>
              </div>
              <div className="border-b border-slate-50 pb-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Phone size={12}/> Telefone</label>
                <p className="font-medium text-slate-800">{cliente.telefone || '-'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Mail size={12}/> E-mail</label>
                <p className="font-medium text-slate-800 truncate" title={cliente.email}>{cliente.email || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: PROCESSOS E DOCUMENTOS */}
        <div className="lg:col-span-2 space-y-6">
          {/* BLOCO DE PROCESSOS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Briefcase size={24} /></div>
                <div><h2 className="font-bold text-slate-800">Processos Vinculados</h2><p className="text-xs text-slate-500">{cliente.processos?.length || 0} processo(s)</p></div>
              </div>
              <button onClick={() => setIsProcessoModalOpen(true)} className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                <Plus size={18} /> Novo Processo
              </button>
            </div>

            {cliente.processos && cliente.processos.length > 0 ? (
              <div className="space-y-4">
                {cliente.processos.map(proc => (
                  <div key={proc.id} className="p-5 border border-slate-100 rounded-xl bg-slate-50 hover:shadow-sm transition-all group animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase bg-white px-2 py-1 rounded border border-slate-200 mr-2">{proc.status || 'Ativo'}</span>
                        <span className="text-sm font-bold text-slate-800">{proc.numero_processo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 mr-2 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded transition-colors"><Edit size={14} /></button>
                          <button onClick={() => handleExcluirProcesso(proc.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"><Trash2 size={14} /></button>
                        </div>
                        <button onClick={() => gerarResumoIA(proc.id, { numero: proc.numero_processo, tipo: proc.tipo_acao, vara: proc.vara })} disabled={loadingIA[proc.id]} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-200 disabled:opacity-50 transition-colors">
                          {loadingIA[proc.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          {resumosIA[proc.id] ? 'Atualizar Resumo' : 'Resumir com IA'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">{proc.titulo || proc.tipo_acao}</p>
                    <p className="text-xs text-slate-500 mt-1">{proc.vara}</p>
                    {resumosIA[proc.id] && (
                      <div className="mt-4 p-4 bg-white border-l-4 border-indigo-500 rounded-r-xl shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 mb-2 text-indigo-600"><Sparkles size={14} /><span className="text-[10px] font-bold uppercase">Resumo Inteligente</span></div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{resumosIA[proc.id]}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl transition-all hover:border-indigo-300 hover:bg-indigo-50/30">
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm"><Briefcase size={28} className="text-indigo-400" /></div>
                <h3 className="text-slate-800 font-bold text-lg mb-2">Nenhum processo vinculado</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">Este cliente ainda não possui processos registados.</p>
                <button onClick={() => setIsProcessoModalOpen(true)} className="flex items-center gap-2 text-sm font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-6 py-3 rounded-xl transition-colors shadow-sm">
                  <Plus size={18} /> Vincular Primeiro Processo
                </button>
              </div>
            )}
          </div>

          {/* BLOCO DE DOCUMENTOS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><FileText size={24} /></div>
                <div><h2 className="font-bold text-slate-800">Cofre de Documentos</h2><p className="text-xs text-slate-500">{cliente.documentos?.length || 0} arquivo(s)</p></div>
              </div>
              <label className="text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                <Upload size={16} /> Anexar
                <input type="file" className="hidden" onChange={handleUploadDocumento} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>
            </div>

            {cliente.documentos && cliente.documentos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cliente.documentos.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:shadow-sm bg-slate-50 group animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText size={20} className="text-slate-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-700 truncate">{doc.titulo}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{doc.extensao} • {doc.tamanho_kb} KB</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleExcluirDocumento(doc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl transition-all hover:border-rose-300 hover:bg-rose-50/30">
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsProcessoModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div><h2 className="text-xl font-bold text-slate-800">Vincular Processo</h2><p className="text-xs text-slate-500">Busca automática via DataJud</p></div>
              <button onClick={() => setIsProcessoModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="form-processo" onSubmit={handleSalvarProcesso} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título / Identificação interna</label>
                  <input type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" value={novoProcesso.titulo} onChange={e => setNovoProcesso({...novoProcesso, titulo: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">NPU do Processo</label>
                  <div className="flex gap-2">
                    <input type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-sm focus:border-indigo-500 outline-none" value={novoProcesso.numero_processo} onChange={e => setNovoProcesso({...novoProcesso, numero_processo: e.target.value})} />
                    <button type="button" onClick={buscarProcessoCNJ} disabled={buscandoCnj} className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 rounded-lg hover:bg-indigo-100 flex items-center justify-center transition-colors">
                      {buscandoCnj ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative mt-6">
                  <span className="absolute -top-3 left-4 bg-slate-50 px-2 text-[10px] font-bold text-slate-500 uppercase">Dados Oficiais</span>
                  <div className="space-y-4">
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Classe Judicial</label><input type="text" required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white outline-none focus:border-indigo-500" value={novoProcesso.tipo_acao} onChange={e => setNovoProcesso({...novoProcesso, tipo_acao: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Órgão Julgador / Vara</label><input type="text" required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white outline-none focus:border-indigo-500" value={novoProcesso.vara} onChange={e => setNovoProcesso({...novoProcesso, vara: e.target.value})} /></div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsProcessoModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" form="form-processo" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md">Salvar Processo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}