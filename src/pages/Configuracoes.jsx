import { useState, useContext, useEffect } from 'react';
import { User, Sliders, Camera, Save, Lock, Moon, Bell, Loader2 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Configuracoes() {
  const { user, setUser } = useContext(AuthContext); 
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [loading, setLoading] = useState(false);

  const [formPerfil, setFormPerfil] = useState({ nome: user?.name || '', oab: user?.oab || '' });
  const [formSenha, setFormSenha] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [preferencias, setPreferencias] = useState(user?.preferencias || { resumo_matinal: true, alertas_urgentes: true, tema: 'claro' });

  async function handleSavePerfil(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedUser = { ...user, name: formPerfil.nome, oab: formPerfil.oab };
      setUser(updatedUser); localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) { toast.error("Erro ao atualizar perfil."); } finally { setLoading(false); }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (formSenha.password !== formSenha.password_confirmation) return toast.error("As novas senhas não coincidem!");
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Senha alterada com sucesso!");
      setFormSenha({ current_password: '', password: '', password_confirmation: '' });
    } catch (error) { toast.error("Erro ao alterar senha."); } finally { setLoading(false); }
  }

  async function handleSavePreferencias() {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const updatedUser = { ...user, preferencias };
      setUser(updatedUser); localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success("Preferências salvas!");
    } catch (error) { toast.error("Erro ao salvar preferências."); } finally { setLoading(false); }
  }

  useEffect(() => { if (user) setFormPerfil({ nome: user.name || user.nome || '', oab: user.oab || '' }); }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Configurações</h1>
          <p className="text-sm text-slate-500">Gerencie sua conta e preferências de uso.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          <button onClick={() => setAbaAtiva('perfil')} className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all active:scale-95 whitespace-nowrap flex-1 ${abaAtiva === 'perfil' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <User size={18} /> Meu Perfil
          </button>
          <button onClick={() => setAbaAtiva('preferencias')} className={`flex items-center justify-center md:justify-start gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all active:scale-95 whitespace-nowrap flex-1 ${abaAtiva === 'preferencias' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <Sliders size={18} /> Preferências
          </button>
        </div>

        <div className="flex-1">
          {abaAtiva === 'perfil' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <form onSubmit={handleSavePerfil} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-6">Informações Pessoais</h2>
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start">
                  <div className="flex flex-col items-center gap-3">
                    <label className="cursor-pointer group relative">
                      <div className="h-28 w-28 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl border-4 border-white shadow-xl overflow-hidden transition-transform group-hover:scale-105 group-active:scale-95">
                        {formPerfil.nome.charAt(0) || 'U'}
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={28} className="text-white" /></div>
                      </div>
                    </label>
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-4 sm:gap-5 w-full">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                      <input type="text" required className="w-full mt-1.5 border-slate-300 border rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={formPerfil.nome} onChange={e => setFormPerfil({...formPerfil, nome: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Número da OAB</label>
                      <input type="text" className="w-full mt-1.5 border-slate-300 border rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={formPerfil.oab} onChange={e => setFormPerfil({...formPerfil, oab: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
                      <input type="email" disabled className="w-full mt-1.5 border-slate-200 border rounded-xl p-3.5 bg-slate-50 text-slate-500 font-medium" value={user?.email || 'admin@lexsaas.com'} />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end pt-5 border-t border-slate-100">
                  <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all shadow-md">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          )}

          {abaAtiva === 'preferencias' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 mb-4"><Moon size={22} className="text-indigo-500"/> Tema Visual</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setPreferencias({...preferencias, tema: 'claro'})} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all active:scale-95 flex-1 ${preferencias.tema === 'claro' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>Tema Claro</button>
                  <button disabled className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-400 font-bold cursor-not-allowed flex-1">Tema Escuro (Em breve)</button>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-100">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 mb-4"><Bell size={22} className="text-amber-500"/> Notificações</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition-all group">
                    <div><p className="font-bold text-slate-700 text-sm group-hover:text-indigo-700">Resumo Matinal</p><p className="text-xs text-slate-500 mt-1">Receber e-mail às 08h com tarefas do dia.</p></div>
                    <input type="checkbox" checked={preferencias.resumo_matinal} onChange={e => setPreferencias({...preferencias, resumo_matinal: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" />
                  </label>
                </div>
              </div>
              <div className="mt-8 flex justify-end pt-5 border-t border-slate-100">
                <button onClick={handleSavePreferencias} disabled={loading} className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md">
                  <Save size={20} /> Salvar Preferências
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}