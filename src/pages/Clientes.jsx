import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, X, ChevronLeft, ChevronRight, User, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

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

  async function carregarClientes(page = 1) {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let dadosMock = [
        { id: 1, nome: 'João Batista Júnior', email: 'joao.batista@email.com', telefone: '(86) 99999-1111', cpf_cnpj: '111.222.333-44', cep: '64000-000', endereco: 'Rua Principal', bairro: 'Centro', cidade: 'Teresina - PI' },
        { id: 2, nome: 'Construtora MG', email: 'contato@mgconstrutora.com.br', telefone: '(86) 3333-4444', cpf_cnpj: '12.345.678/0001-99', cep: '64000-000', endereco: 'Av. Frei Serafim', bairro: 'Centro', cidade: 'Teresina - PI' },
        { id: 3, nome: 'Clínica Veterinária São Francisco', email: 'adm@saofranciscovet.com', telefone: '(86) 9999-5555', cpf_cnpj: '98.765.432/0001-11', cep: '64001-000', endereco: 'Rua Coelho de Resende', bairro: 'Centro', cidade: 'Teresina - PI' },
        { id: 4, nome: 'Maria Souza', email: 'maria.souza@email.com', telefone: '(11) 98888-2222', cpf_cnpj: '555.666.777-88', cep: '01001-000', endereco: 'Praça da Sé', bairro: 'Sé', cidade: 'São Paulo - SP' },
      ];

      if (busca) dadosMock = dadosMock.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cpf_cnpj.includes(busca));
      
      setClientes(dadosMock); 
      setPaginaAtual(1);
      setUltimaPagina(1);
      setTotalRegistros(dadosMock.length);
    } catch (error) {
      toast.error("Erro ao carregar lista de clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { carregarClientes(1); }, 500);
    return () => clearTimeout(delayDebounceFn);
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
      await new Promise(resolve => setTimeout(resolve, 600)); 
      toast.success(editandoId ? "Cliente atualizado com sucesso!" : "Cliente registado com sucesso!");
      fecharGaveta();
      carregarClientes(paginaAtual);
    } catch (error) { toast.error("Erro ao guardar cliente."); }
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
      await new Promise(resolve => setTimeout(resolve, 600));
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Clientes</h1>
          <p className="text-sm text-slate-500">Gerencie a sua carteira de clientes e processos.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Buscar por nome ou CPF..." 
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              value={busca} onChange={e => setBusca(e.target.value)}
            />
          </div>
          <button 
            onClick={abrirNovo}
            className="flex items-center justify-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} /> <span className="sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* TABELA PRINCIPAL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
              <tr>
                <th className="px-4 sm:px-6 py-4">Cliente</th>
                <th className="px-4 sm:px-6 py-4">Documento</th>
                <th className="px-4 sm:px-6 py-4">Contato</th>
                <th className="px-4 sm:px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold shrink-0">
                          {cliente.nome.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-sm sm:text-base">{cliente.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 font-mono text-xs">{cliente.cpf_cnpj || '-'}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <p className="text-slate-700 text-xs sm:text-sm">{cliente.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cliente.telefone}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      {/* No mobile, os botões aparecem sempre. No PC, só no hover para ficar mais limpo. */}
                      <div className="flex justify-end items-center gap-1 sm:gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Link to={`/clientes/${cliente.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors active:scale-95" title="Ver Ficha Completa">
                          <Eye size={18} />
                        </Link>
                        <button onClick={() => abrirEdicao(cliente)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors active:scale-95" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => setClienteParaExcluir(cliente)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95" title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <User size={40} className="text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-700">Nenhum cliente encontrado</p>
                      <p className="text-sm">Tente ajustar a sua busca ou crie um novo registo.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* RODAPÉ DE PAGINAÇÃO */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            Página <span className="font-bold text-slate-700">{paginaAtual}</span> de <span className="font-bold text-slate-700">{ultimaPagina}</span> 
            <span className="inline"> (Total: {totalRegistros} registos)</span>
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              disabled={true}
              className="flex-1 sm:flex-none flex justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={true}
              className="flex-1 sm:flex-none flex justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* GAVETA LATERAL (SLIDE-OVER) PARA NOVO/EDITAR CLIENTE */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={fecharGaveta}></div>
          
          <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editandoId ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Preencha os dados abaixo</p>
              </div>
              <button onClick={fecharGaveta} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"><X size={20} /></button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="form-cliente" onSubmit={handleSalvarCliente} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nome Completo</label>
                  <input type="text" required className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-shadow" value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">E-mail</label>
                    <input type="email" className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-shadow" value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Telefone</label>
                    <input type="text" className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-shadow" value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">CPF / CNPJ</label>
                  <input type="text" required className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-shadow" value={novoCliente.cpf_cnpj} onChange={e => setNovoCliente({...novoCliente, cpf_cnpj: e.target.value})} />
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 mt-6 relative">
                  <span className="absolute -top-3 left-4 bg-slate-50 px-2 text-xs font-bold text-slate-500 uppercase">Endereço</span>
                  <div className="space-y-4">
                    <div className="flex flex-col xs:flex-row gap-3">
                      <div className="w-full xs:w-1/3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CEP</label>
                        <input 
                          type="text" placeholder="00000-000" 
                          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                          value={novoCliente.cep} 
                          onChange={e => setNovoCliente({...novoCliente, cep: e.target.value})}
                          onBlur={e => buscarCep(e.target.value)} 
                        />
                      </div>
                      <div className="w-full xs:w-2/3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cidade / UF</label>
                        <input type="text" readOnly className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-500" value={novoCliente.cidade} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Logradouro / Bairro</label>
                      <input type="text" readOnly className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-500" value={novoCliente.endereco ? `${novoCliente.endereco}, ${novoCliente.bairro}` : ''} />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* BOTÕES DA GAVETA (No mobile ficam empilhados se precisar, mas lado a lado é melhor) */}
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={fecharGaveta} className="px-4 sm:px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors active:scale-95 text-sm sm:text-base">Cancelar</button>
              <button type="submit" form="form-cliente" className="bg-sky-600 text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-md active:scale-95 text-sm sm:text-base">
                {editandoId ? 'Atualizar Cliente' : 'Salvar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BONITO DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {clienteParaExcluir && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setClienteParaExcluir(null)}></div>
          
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 border-4 border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Cliente?</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Tem a certeza que deseja excluir permanentemente <span className="font-bold text-slate-700">{clienteParaExcluir.nome}</span>? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setClienteParaExcluir(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors active:scale-95">
                  Cancelar
                </button>
                <button onClick={confirmarExclusao} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm shadow-red-200 active:scale-95">
                  Sim, excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}