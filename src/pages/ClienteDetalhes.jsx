import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Briefcase, FileText, Plus, Search, X, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; // Ajuste o caminho se necessário (ex: '../services/api')

export default function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isProcessoModalOpen, setIsProcessoModalOpen] = useState(false);
  const [buscandoCnj, setBuscandoCnj] = useState(false);
  const [novoProcesso, setNovoProcesso] = useState({ titulo: '', numero_processo: '', tipo_acao: '', vara: '', status: 'Ativo' });

  // 👇 1. Busca Real do Cliente com Processos e Documentos 👇
  async function carregarCliente() {
    try {
      setLoading(true);
      // O Laravel vai devolver o cliente + processos + documentos (graças ao método show do ClienteController)
      const response = await api.get(`/clientes/${id}`);
      setCliente(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar os dados do cliente.");
      navigate('/clientes'); // Volta para a lista se o cliente não existir
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarCliente(); }, [id]);

  // 👇 2. Busca Real no DataJud/CNJ (Rota que temos no api.php) 👇
  async function buscarProcessoCNJ() {
    if (!novoProcesso.numero_processo) return toast.error("Digite o NPU do processo.");
    
    // Remove as pontuações do NPU para a busca
    const npuLimpo = novoProcesso.numero_processo.replace(/\D/g, '');
    if (npuLimpo.length !== 20) return toast.error("O NPU deve ter 20 dígitos.");

    try {
      setBuscandoCnj(true);
      const response = await api.get(`/processos/cnj/${npuLimpo}`);
      
      // Supondo que a nossa API devolve 'classe' e 'orgao'
      setNovoProcesso(prev => ({ 
        ...prev, 
        tipo_acao: response.data.classe || 'Ação Cível', 
        vara: response.data.orgao || 'Vara não identificada' 
      }));
      toast.success("Dados encontrados!");
    } catch (error) {
      toast.error("Não foi possível buscar no CNJ automaticamente.");
    } finally {
      setBuscandoCnj(false);
    }
  }

  // 👇 3. Salvar Processo Real 👇
  async function handleSalvarProcesso(e) {
    e.preventDefault();
    try {
      // Passamos o cliente_id junto com os dados do processo
      await api.post('/processos', { ...novoProcesso, cliente_id: id });
      
      toast.success("Processo vinculado com sucesso!");
      setIsProcessoModalOpen(false);
      setNovoProcesso({ titulo: '', numero_processo: '', tipo_acao: '', vara: '', status: 'Ativo' });
      carregarCliente(); // Recarrega a ficha para mostrar o novo processo
    } catch (error) {
      console.error(error);
      toast.error("Erro ao vincular o processo.");
    }
  }

  // 👇 4. Excluir Processo Real 👇
  async function handleExcluirProcesso(processoId) {
    if (!window.confirm("Tem a certeza que deseja desvincular este processo?")) return;
    try {
      await api.delete(`/processos/${processoId}`);
      toast.success("Processo excluído!");
      carregarCliente(); // Atualiza a lista
    } catch (error) {
      toast.error("Erro ao excluir o processo.");
    }
  }

  // 👇 5. Upload Real de Documentos para o Cofre 👇
  async function handleUploadDocumento(e) {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Enviando documento para o cofre seguro...");
    
    // Para enviar arquivos no React, precisamos de um FormData
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('titulo', file.name);
    formData.append('cliente_id', id);

    try {
      await api.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Documento guardado com sucesso!", { id: toastId });
      carregarCliente(); // Atualiza a lista de documentos
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar o documento.", { id: toastId });
    }
  }

  // 👇 6. Excluir Documento Real 👇
  async function handleExcluirDocumento(docId) {
    if (!window.confirm("Tem a certeza que deseja excluir permanentemente este documento?")) return;
    try {
      await api.delete(`/documentos/${docId}`);
      toast.success("Documento excluído!");
      carregarCliente();
    } catch (error) {
      toast.error("Erro ao excluir documento.");
    }
  }

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-full text-slate-500 gap-4 mt-20">
      <Loader2 size={32} className="animate-spin text-indigo-500" />
      <p>A carregar ficha do cliente...</p>
    </div>
  );
  
  if (!cliente) return null;

  return (
    <div className="space-y-4 sm:space-y-6 pb-10 relative animate-in fade-in duration-300">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/clientes" className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors shadow-sm active:scale-95 shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div className="overflow-hidden">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate transition-colors">{cliente.nome}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">Ficha do Cliente / Visão 360</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* COLUNA ESQUERDA: DADOS PESSOAIS */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 dark:bg-sky-900/10 rounded-bl-full -z-10 transition-colors"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 sm:p-3.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl transition-colors"><User size={24} /></div>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">Dados Pessoais</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Contato principal</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border-b border-slate-50 dark:border-slate-800/50 pb-3 transition-colors">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase transition-colors">CPF / CNPJ</label>
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base transition-colors">{cliente.cpf_cnpj || '-'}</p>
              </div>
              <div className="border-b border-slate-50 dark:border-slate-800/50 pb-3 transition-colors">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1 transition-colors"><Phone size={12}/> Telefone</label>
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base transition-colors">{cliente.telefone || '-'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1 transition-colors"><Mail size={12}/> E-mail</label>
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate transition-colors" title={cliente.email}>{cliente.email || '-'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1 transition-colors">Endereço</label>
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate transition-colors">
                  {cliente.endereco ? `${cliente.endereco}, ${cliente.cidade}` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: PROCESSOS E DOCUMENTOS */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* BLOCO DE PROCESSOS */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 sm:p-3.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-colors"><Briefcase size={24} /></div>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">Processos Vinculados</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{cliente.processos?.length || 0} processo(s)</p>
                </div>
              </div>
              <button onClick={() => setIsProcessoModalOpen(true)} className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 w-full sm:w-auto">
                <Plus size={18} /> Novo Processo
              </button>
            </div>

            {cliente.processos && cliente.processos.length > 0 ? (
              <div className="space-y-4">
                {cliente.processos.map(proc => (
                  <div key={proc.id} className="p-4 sm:p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:shadow-sm transition-all group animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col xs:flex-row justify-between items-start gap-3 mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 mr-2 shadow-sm transition-colors">{proc.status || 'Ativo'}</span>
                        <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 break-all transition-colors">{proc.numero_processo}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full xs:w-auto justify-between xs:justify-end">
                        <div className="flex gap-1">
                          <button onClick={() => handleExcluirProcesso(proc.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-slate-700 rounded-lg transition-colors active:scale-95"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium transition-colors">{proc.titulo || proc.tipo_acao}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">{proc.vara}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl transition-colors">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors"><Briefcase size={28} className="text-indigo-400 dark:text-indigo-500" /></div>
                <h3 className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-2 transition-colors">Nenhum processo vinculado</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6 leading-relaxed transition-colors">Este cliente ainda não possui processos registados.</p>
              </div>
            )}
          </div>

          {/* BLOCO DE DOCUMENTOS */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 sm:p-3.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl transition-colors"><FileText size={24} /></div>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">Cofre de Documentos</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{cliente.documentos?.length || 0} arquivo(s)</p>
                </div>
              </div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 w-full sm:w-auto">
                <Upload size={18} /> Anexar
                <input type="file" className="hidden" onChange={handleUploadDocumento} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>
            </div>

            {cliente.documentos && cliente.documentos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {cliente.documentos.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-md bg-slate-50 dark:bg-slate-800/50 group animate-in fade-in zoom-in-95 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm shrink-0 transition-colors"><FileText size={20} className="text-rose-500 dark:text-rose-400" /></div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate transition-colors">{doc.titulo}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium mt-0.5 transition-colors">
                          {doc.extensao || 'DOC'} • {doc.tamanho_kb ? `${doc.tamanho_kb} KB` : 'Tamanho n/a'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {/* Se o Laravel devolveu uma URL, mostramos o botão de download */}
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer" className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95" title="Baixar Arquivo">
                          <FileText size={18} />
                        </a>
                      )}
                      <button onClick={() => handleExcluirDocumento(doc.id)} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95" title="Excluir"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl transition-colors">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-3 shadow-sm transition-colors"><FileText size={24} className="text-rose-400 dark:text-rose-500" /></div>
                <h3 className="text-slate-800 dark:text-slate-200 font-bold mb-1 transition-colors">Cofre Vazio</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-5 transition-colors">Ainda não foram anexados documentos.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GAVETA / MODAL DE VINCULAR PROCESSO */}
      {isProcessoModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsProcessoModalOpen(false)}></div>
          
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 transition-colors">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 transition-colors">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Vincular Processo</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Busca automática via DataJud</p>
              </div>
              <button onClick={() => setIsProcessoModalOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors active:scale-95"><X size={20} /></button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="form-processo" onSubmit={handleSalvarProcesso} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block transition-colors">Título / Identificação interna</label>
                  <input type="text" required className="w-full bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={novoProcesso.titulo} onChange={e => setNovoProcesso({...novoProcesso, titulo: e.target.value})} placeholder="Ex: Divórcio Consensual" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block transition-colors">NPU do Processo</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" required className="w-full bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" value={novoProcesso.numero_processo} onChange={e => setNovoProcesso({...novoProcesso, numero_processo: e.target.value})} placeholder="0000000-00.0000.0.00.0000" />
                    
                    <button type="button" onClick={buscarProcessoCNJ} disabled={buscandoCnj} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 px-5 py-3 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex justify-center items-center gap-2 transition-colors active:scale-95">
                      {buscandoCnj ? <Loader2 size={18} className="animate-spin" /> : <><Search size={18} /> Buscar</>}
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative mt-6 transition-colors">
                  <span className="absolute -top-3 left-4 bg-slate-50 dark:bg-slate-900 px-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase transition-colors">Dados Oficiais</span>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1 transition-colors">Classe Judicial</label>
                      <input type="text" required className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={novoProcesso.tipo_acao} onChange={e => setNovoProcesso({...novoProcesso, tipo_acao: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1 transition-colors">Órgão Julgador / Vara</label>
                      <input type="text" required className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={novoProcesso.vara} onChange={e => setNovoProcesso({...novoProcesso, vara: e.target.value})} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0 transition-colors">
              <button type="button" onClick={() => setIsProcessoModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95">Cancelar</button>
              <button type="submit" form="form-processo" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors shadow-md active:scale-95">Salvar Processo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}