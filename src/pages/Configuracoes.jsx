import { useState, useEffect } from 'react';
import { 
  User, Building2, ShieldCheck, Palette, Globe, 
  Save, Moon, Sun, Key, Loader2, Users, PlusCircle, Trash2, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [userRole, setUserRole] = useState('admin'); 

  // Estados dos formulários
  const [perfil, setPerfil] = useState({ nome: '', email: '', oab: '', telefone: '' });
  const [escritorio, setEscritorio] = useState({ nome: '', cnpj: '', endereco: '', logo: null });
  const [sistema, setSistema] = useState({ cnj_key: '', dias_antecedencia_aviso: '2' });
  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmar: '' });
  
  // Estados da Equipa
  const [equipe, setEquipe] = useState([]);
  const [novoMembro, setNovoMembro] = useState({ name: '', email: '', password: '', role: 'advogado' });
  const [loadingMembro, setLoadingMembro] = useState(false);
  
  // 👇 NOVO: Estado para controlar a modal de exclusão da equipa 👇
  const [membroParaExcluir, setMembroParaExcluir] = useState(null);

  const labelEstilo = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block transition-colors";
  const inputEstilo = "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm";

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    toast.success(`Modo ${isDark ? 'Escuro' : 'Claro'} ativado!`);
  };

  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      const response = await api.get('/configuracoes');
      const { user, tenant, equipe } = response.data;

      setUserRole(user.role || 'admin');
      if (equipe) setEquipe(equipe);

      setPerfil({ nome: user.name || '', email: user.email || '', oab: user.oab || '', telefone: user.telefone || '' });
      setEscritorio({ nome: tenant.nome || tenant.name || '', cnpj: tenant.cnpj || '', endereco: tenant.endereco || '', logo: tenant.logo_url });
      setSistema({ cnj_key: tenant.cnj_key || '', dias_antecedencia_aviso: tenant.config_prazos?.toString() || '2' });
    } catch (error) { toast.error("Erro ao carregar configurações."); } 
    finally { setLoading(false); }
  }

  useEffect(() => { carregarConfiguracoes(); }, []);

  async function handleSalvar(e) {
    e.preventDefault();
    if (senhas.nova && senhas.nova !== senhas.confirmar) return toast.error("As senhas não coincidem!");
    setLoading(true);
    
    try {
      if (abaAtiva === 'perfil' || abaAtiva === 'seguranca') {
          const payload = { name: perfil.nome, telefone: perfil.telefone, oab: perfil.oab };
          if (senhas.nova) payload.password = senhas.nova;
          await api.put('/profile', payload);
          toast.success("Perfil atualizado com sucesso!");
          setSenhas({ atual: '', nova: '', confirmar: '' }); 
      } else {
          await api.put('/configuracoes', { escritorio, sistema });
          toast.success("Configurações atualizadas!");
      }
    } catch (error) { 
        toast.error("Erro ao guardar alterações."); 
    } finally { 
        setLoading(false); 
    }
  }

  async function handleAdicionarMembro(e) {
    e.preventDefault();
    setLoadingMembro(true);
    try {
      await api.post('/configuracoes/equipe', novoMembro);
      toast.success("Membro adicionado à equipa!");
      setNovoMembro({ name: '', email: '', password: '', role: 'advogado' });
      carregarConfiguracoes();
    } catch (error) { toast.error(error.response?.data?.message || "Erro ao adicionar membro."); }
    finally { setLoadingMembro(false); }
  }

  // 👇 NOVA FUNÇÃO: Substitui o window.confirm pelo fluxo da Modal 👇
  async function confirmarExclusaoMembro() {
    if (!membroParaExcluir) return;
    try {
      await api.delete(`/configuracoes/equipe/${membroParaExcluir.id}`);
      toast.success("Membro removido da equipa.");
      setMembroParaExcluir(null); // Fecha a modal
      carregarConfiguracoes(); // Recarrega a lista
    } catch (error) { 
      toast.error(error.response?.data?.error || "Erro ao remover membro."); 
    }
  }

  const baseMenuItems = [
    { id: 'perfil', label: 'Meu Perfil', icon: User },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
  ];
  const adminMenuItems = [
    { id: 'escritorio', label: 'Escritório', icon: Building2 },
    { id: 'sistema', label: 'Sistema e API', icon: Globe },
    { id: 'equipe', label: 'Gestão de Equipa', icon: Users },
  ];
  const menuItems = userRole === 'admin' ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)] animate-in fade-in duration-500 relative">
      
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm">
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setAbaAtiva(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  abaAtiva === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        
        {abaAtiva !== 'equipe' ? (
          <form onSubmit={handleSalvar} className="flex flex-col h-full">
            <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar">
              
              {abaAtiva === 'perfil' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 max-w-3xl">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Informações Pessoais</h2>
                    <p className="text-sm text-slate-500">Atualize os seus dados de contacto.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className={labelEstilo}>Nome Completo</label><input type="text" className={inputEstilo} value={perfil.nome} onChange={e => setPerfil({...perfil, nome: e.target.value})} /></div>
                    <div><label className={labelEstilo}>E-mail</label><input type="email" disabled className={`${inputEstilo} opacity-60 cursor-not-allowed`} value={perfil.email} /></div>
                    <div><label className={labelEstilo}>Carteira OAB</label><input type="text" className={inputEstilo} value={perfil.oab} onChange={e => setPerfil({...perfil, oab: e.target.value})} /></div>
                    <div><label className={labelEstilo}>Telefone</label><input type="text" className={inputEstilo} value={perfil.telefone} onChange={e => setPerfil({...perfil, telefone: e.target.value})} /></div>
                  </div>
                </div>
              )}

              {userRole === 'admin' && abaAtiva === 'escritorio' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 max-w-3xl">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Identidade do Escritório</h2>
                    <p className="text-sm text-slate-500">Configure o nome e os dados fiscais do seu Tenant.</p>
                  </div>
                  <div className="space-y-6">
                    <div><label className={labelEstilo}>Razão Social</label><input type="text" className={inputEstilo} value={escritorio.nome} onChange={e => setEscritorio({...escritorio, nome: e.target.value})} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className={labelEstilo}>CNPJ</label><input type="text" className={inputEstilo} value={escritorio.cnpj} onChange={e => setEscritorio({...escritorio, cnpj: e.target.value})} /></div>
                      <div><label className={labelEstilo}>Endereço Completo</label><input type="text" className={inputEstilo} value={escritorio.endereco} onChange={e => setEscritorio({...escritorio, endereco: e.target.value})} /></div>
                    </div>
                  </div>
                </div>
              )}

              {userRole === 'admin' && abaAtiva === 'sistema' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 max-w-3xl">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Integrações (API)</h2>
                  </div>
                  <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
                    <h4 className="text-base font-bold text-amber-900 dark:text-amber-300 mb-1">DataJud API (CNJ)</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400/80 mb-4">Insira a sua chave pública fornecida pelo CNJ.</p>
                    <input type="password" placeholder="Insira a sua API Key secreta..." className="w-full bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-700/50 rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-amber-500" value={sistema.cnj_key} onChange={e => setSistema({...sistema, cnj_key: e.target.value})} />
                  </div>
                </div>
              )}

              {abaAtiva === 'aparencia' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-right-4 max-w-3xl">
                  <button type="button" onClick={() => darkMode && toggleDarkMode()} className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center gap-5 transition-all ${!darkMode ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 dark:border-slate-800'}`}><Sun size={36} className="text-amber-500"/> <span className="font-bold">Modo Claro</span></button>
                  <button type="button" onClick={() => !darkMode && toggleDarkMode()} className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center gap-5 transition-all ${darkMode ? 'border-indigo-600 bg-indigo-900/20 shadow-md' : 'border-slate-200 dark:border-slate-800'}`}><Moon size={36} className="text-indigo-400"/> <span className="font-bold">Modo Escuro</span></button>
                </div>
              )}

              {abaAtiva === 'seguranca' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 max-w-2xl">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-5"><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Segurança da Conta</h2></div>
                  <div><label className={labelEstilo}>Senha Atual</label><input type="password" placeholder="Digite a senha atual" className={inputEstilo} value={senhas.atual} onChange={e => setSenhas({...senhas, atual: e.target.value})} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className={labelEstilo}>Nova Senha</label><input type="password" placeholder="Mínimo 8 caracteres" className={inputEstilo} value={senhas.nova} onChange={e => setSenhas({...senhas, nova: e.target.value})} /></div>
                    <div><label className={labelEstilo}>Confirmar Nova Senha</label><input type="password" placeholder="Repita a nova senha" className={inputEstilo} value={senhas.confirmar} onChange={e => setSenhas({...senhas, confirmar: e.target.value})} /></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0">
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md active:scale-95 disabled:opacity-50"><Save size={20} /> Salvar Alterações</button>
            </div>
          </form>

        ) : (

          <div className="flex flex-col h-full">
            <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gestão de Equipa</h2>
                  <p className="text-sm text-slate-500">Convide associados e defina os acessos.</p>
                </div>
              </div>

              <form onSubmit={handleAdicionarMembro} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 mb-8">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4"><PlusCircle size={18} className="text-sky-500"/> Adicionar Novo Membro</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><label className={labelEstilo}>Nome</label><input required type="text" className={inputEstilo} value={novoMembro.name} onChange={e => setNovoMembro({...novoMembro, name: e.target.value})} placeholder="Nome" /></div>
                  <div><label className={labelEstilo}>E-mail</label><input required type="email" className={inputEstilo} value={novoMembro.email} onChange={e => setNovoMembro({...novoMembro, email: e.target.value})} placeholder="email@lex.com" /></div>
                  <div><label className={labelEstilo}>Senha Provisória</label><input required type="password" minLength="8" className={inputEstilo} value={novoMembro.password} onChange={e => setNovoMembro({...novoMembro, password: e.target.value})} placeholder="Mínimo 8 caract." /></div>
                  <div>
                    <label className={labelEstilo}>Nível de Acesso</label>
                    <select className={inputEstilo} value={novoMembro.role} onChange={e => setNovoMembro({...novoMembro, role: e.target.value})}>
                      <option value="advogado">Advogado (Padrão)</option>
                      <option value="estagiario">Estagiário (Sem Excluir)</option>
                      <option value="admin">Administrador (Tudo)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button type="submit" disabled={loadingMembro} className="bg-slate-800 dark:bg-sky-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {loadingMembro ? <Loader2 size={16} className="animate-spin"/> : 'Convidar Membro'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <label className={labelEstilo}>Membros Atuais ({equipe.length})</label>
                {equipe.map(membro => (
                  <div key={membro.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg">{membro.name.charAt(0)}</div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{membro.name}</h4>
                        <p className="text-xs text-slate-500">{membro.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase ${membro.role === 'admin' ? 'bg-rose-100 text-rose-700' : membro.role === 'advogado' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-700'}`}>
                        {membro.role}
                      </span>
                      {/* 👇 NOVO: Em vez de window.confirm, abrimos a modal 👇 */}
                      <button onClick={() => setMembroParaExcluir(membro)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors active:scale-95 tooltip" title="Remover Acesso">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* 👇 MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE EQUIPA 👇 */}
      {membroParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMembroParaExcluir(null)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Remover Acesso?</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
              Tem certeza que deseja remover permanentemente o acesso de <span className="font-bold text-slate-700 dark:text-slate-300">{membroParaExcluir.name}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setMembroParaExcluir(null)} className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                Cancelar
              </button>
              <button type="button" onClick={confirmarExclusaoMembro} className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md active:scale-95">
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}