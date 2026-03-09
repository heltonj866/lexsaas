import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, X, ChevronLeft, ChevronRight, User, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);

  const formVazio = { nome: '', email: '', telefone: '', cpf_cnpj: '', cep: '', endereco: '', bairro: '', cidade: '' };
  const [novoCliente, setNovoCliente] = useState(formVazio);

  // --- ESTILOS PREMIUM PADRONIZADOS ---
  const labelEstilo = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block transition-colors";
  const inputEstilo = "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all shadow-sm";

  async function carregarClientes(page = 1) {
    try {
      setLoading(true);
      const response = await api.get(`/clientes?page=${page}&busca=${busca}`);
      setClientes(response.data.data); 
      setPaginaAtual(response.data.current_page);
      setUltimaPagina(response.data.last_page);
      setTotalRegistros(response.data.total);
    } catch (error) {
      toast.error("Erro ao carregar lista de clientes.");
      setClientes([]);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const delay = setTimeout(() => { carregarClientes(1); }, 500);
    return () => clearTimeout(delay);
  }, [busca]);

  async function buscarCep(cep) {
    const valor = cep?.replace(/\D/g, '') || ''; 
    if (valor.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setNovoCliente(prev => ({...prev, endereco: data.logradouro, bairro: data.bairro, cidade: `${data.localidade} - ${data.uf}`}));
        toast.success("Endereço preenchido automaticamente!");
      } else toast.error("CEP não encontrado.");
    } catch (error) { toast.error("Erro na busca do CEP."); }
  }

  async function handleSalvarCliente(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, novoCliente);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await api.post('/clientes', novoCliente);
        toast.success("Cliente registado com sucesso!");
      }
      fecharGaveta();
      carregarClientes(paginaAtual); 
    } catch (error) { 
      toast.error(error.response?.data?.message || "Erro ao guardar cliente."); 
    }
  }

  function abrirEdicao(cliente) {
    setNovoCliente({
      nome: cliente.nome || '', email: cliente.email || '', telefone: cliente.telefone || '',
      cpf_cnpj: cliente.cpf_cnpj || '', cep: cliente.cep || '', endereco: cliente.endereco || '',
      bairro: cliente.bairro || '', cidade: cliente.cidade || ''
    });
    setEditandoId(cliente.id);
    setIsDrawerOpen(true);
  }

  function abrirNovo() {
    setNovoCliente(formVazio);
    setEditandoId(null);
    setIsDrawerOpen(true);
  }

  function fecharGaveta() {
    setIsDrawerOpen(false);
    setTimeout(() => { setNovoCliente(formVazio); setEditandoId(null); }, 300);
  }

  async function confirmarExclusao() {
    if (!clienteParaExcluir) return;
    try {
      await api.delete(`/clientes/${clienteParaExcluir.id}`);
      toast.success("Cliente excluído com sucesso!");
      setClienteParaExcluir(null);
      carregarClientes(paginaAtual); 
    } catch (error) { toast.error("Erro ao excluir cliente."); }
  }

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col h-full animate-in fade-in duration-300">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Clientes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie a sua carteira de clientes e processos.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por nome ou CPF..." className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none transition-all" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <button onClick={abrirNovo} className="flex items-center justify-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-sm active:scale-95 whitespace-nowrap">
            <Plus size={20} /> <span className="sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* TABELA PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
              <tr>
                <th className="px-4 sm:px-6 py-4">Cliente</th>
                <th className="px-4 sm:px-6 py-4">Documento</th>
                <th className="px-4 sm:px-6 py-4">Contato</th>
                <th className="px-4 sm:px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
                          {cliente.nome.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{cliente.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{cliente.cpf_cnpj || '-'}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{cliente.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cliente.telefone}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Link to={`/clientes/${cliente.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg active:scale-95" title="Ficha Completa"><Eye size={18} /></Link>
                        <button onClick={() => abrirEdicao(cliente)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg active:scale-95" title="Editar"><Edit size={18} /></button>
                        <button onClick={() => setClienteParaExcluir(cliente)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg active:scale-95" title="Excluir"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500"><User size={40} className="mx-auto mb-3 opacity-50" /><p className="text-base font-medium">Nenhum cliente encontrado</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* RODAPÉ DE PAGINAÇÃO */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">Página <span className="font-bold">{paginaAtual}</span> de <span className="font-bold">{ultimaPagina}</span></p>
          <div className="flex gap-2">
            <button onClick={() => carregarClientes(paginaAtual - 1)} disabled={paginaAtual === 1} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={18} /></button>
            <button onClick={() => carregarClientes(paginaAtual + 1)} disabled={paginaAtual === ultimaPagina} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* GAVETA LATERAL PREMIUM (Resolvido o Clipping) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={fecharGaveta}></div>
          
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <p className="text-xs text-slate-500 mt-1">Preencha os dados abaixo</p>
              </div>
              <button onClick={fecharGaveta} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-full active:scale-95"><X size={20} /></button>
            </div>

            {/* ADICIONADO: p-2 interno extra e pb-10 para não esmagar no fundo */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="form-cliente" onSubmit={handleSalvarCliente} className="space-y-5 pb-8 px-1">
                <div>
                  <label className={labelEstilo}>Nome Completo</label>
                  <input type="text" required className={inputEstilo} value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} placeholder="Nome do cliente" />
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div>
                    <label className={labelEstilo}>E-mail</label>
                    <input type="email" className={inputEstilo} value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} placeholder="cliente@email.com" />
                  </div>
                  <div>
                    <label className={labelEstilo}>Telefone</label>
                    <input type="text" className={inputEstilo} value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} placeholder="(00) 00000-0000" />
                  </div>
                </div>

                <div>
                  <label className={labelEstilo}>CPF / CNPJ</label>
                  <input type="text" required className={inputEstilo} value={novoCliente.cpf_cnpj} onChange={e => setNovoCliente({...novoCliente, cpf_cnpj: e.target.value})} placeholder="000.000.000-00" />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mt-8 relative">
                  <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-2 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase border border-slate-200 dark:border-slate-800 rounded-md">Endereço</span>
                  <div className="space-y-4">
                    <div className="flex flex-col xs:flex-row gap-3">
                      <div className="w-full xs:w-1/3">
                        <label className={labelEstilo}>CEP</label>
                        <input type="text" placeholder="00000-000" className={inputEstilo} value={novoCliente.cep} onChange={e => setNovoCliente({...novoCliente, cep: e.target.value})} onBlur={e => buscarCep(e.target.value)} />
                      </div>
                      <div className="w-full xs:w-2/3">
                        <label className={labelEstilo}>Cidade / UF</label>
                        <input type="text" readOnly className={`${inputEstilo} bg-slate-100 dark:bg-slate-800/80 cursor-not-allowed`} value={novoCliente.cidade} placeholder="Automático" />
                      </div>
                    </div>
                    <div>
                      <label className={labelEstilo}>Logradouro / Bairro</label>
                      <input type="text" readOnly className={`${inputEstilo} bg-slate-100 dark:bg-slate-800/80 cursor-not-allowed`} value={novoCliente.endereco ? `${novoCliente.endereco}, ${novoCliente.bairro}` : ''} placeholder="Automático" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={fecharGaveta} className="px-5 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95 text-sm">Cancelar</button>
              <button type="submit" form="form-cliente" className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-md active:scale-95 text-sm">
                {editandoId ? 'Atualizar Cliente' : 'Salvar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ... Modal de Exclusão permanece igual ... */}
    </div>
  );
}