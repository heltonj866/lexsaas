import { useState, useContext } from 'react';
import { User, Sliders, Camera, Save, Moon, Sun, Loader2 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Configuracoes() {
  const { user, theme, toggleTheme } = useContext(AuthContext); 
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [loading, setLoading] = useState(false);

  const [formPerfil, setFormPerfil] = useState({ nome: user?.name || '', oab: user?.oab || '' });

  async function handleSavePerfil(e) {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Perfil atualizado com sucesso!");
    setLoading(false);
  }

  async function handleSavePreferencias() {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    toast.success("Preferências salvas!");
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Configurações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Gerencie a sua conta e preferências de uso.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* MENU LATERAL DE ABAS */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          <button onClick={() => setAbaAtiva('perfil')} className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all active:scale-95 flex-1 ${
            abaAtiva === 'perfil' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'
          }`}>
            <User size={18} /> Meu Perfil
          </button>
          <button onClick={() => setAbaAtiva('preferencias')} className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all active:scale-95 flex-1 ${
            abaAtiva === 'preferencias' 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'
          }`}>
            <Sliders size={18} /> Preferências
          </button>
        </div>

        {/* ÁREA DE CONTEÚDO DAS ABAS */}
        <div className="flex-1">
          
          {/* ABA: MEU PERFIL */}
          {abaAtiva === 'perfil' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <form onSubmit={handleSavePerfil} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 transition-colors duration-300">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 transition-colors">Informações Pessoais</h2>
                
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="h-28 w-28 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-4xl border-4 border-white dark:border-slate-800 shadow-xl relative cursor-pointer group transition-colors">
                      {formPerfil.nome.charAt(0) || 'U'}
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-[2px]">
                        <Camera size={28} className="text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Campos do Formulário */}
                  <div className="flex-1 grid grid-cols-1 gap-4 sm:gap-5 w-full">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 transition-colors">Nome Completo</label>
                      <input type="text" className="w-full mt-1.5 border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formPerfil.nome} onChange={e => setFormPerfil({...formPerfil, nome: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 transition-colors">E-mail</label>
                      <input type="email" disabled className="w-full mt-1.5 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500 cursor-not-allowed transition-all" value={user?.email || 'admin@lexsaas.com'} />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800 transition-colors">
                  <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 active:scale-95 transition-all shadow-sm">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ABA: PREFERÊNCIAS (MODO NOTURNO) */}
          {abaAtiva === 'preferencias' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8 animate-in slide-in-from-right-4 duration-300 transition-colors">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 transition-colors">
                  <Moon size={22} className="text-indigo-500 dark:text-indigo-400"/> Tema Visual
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 transition-colors">Escolha como prefere visualizar o sistema. O modo escuro é ideal para reduzir o cansaço visual.</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => toggleTheme('claro')} 
                    className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 font-bold transition-all active:scale-95 flex-1 ${
                      theme === 'claro' 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Sun size={24} className={theme === 'claro' ? 'text-indigo-600' : ''} /> Tema Claro
                  </button>
                  <button 
                    onClick={() => toggleTheme('escuro')} 
                    className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 font-bold transition-all active:scale-95 flex-1 ${
                      theme === 'escuro' 
                        ? 'bg-slate-800 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Moon size={24} className={theme === 'escuro' ? 'text-indigo-400' : ''} /> Tema Escuro
                  </button>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <button onClick={handleSavePreferencias} disabled={loading} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 active:scale-95 transition-all shadow-sm">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}