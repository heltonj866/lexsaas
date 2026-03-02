import { useState, useContext, useEffect } from 'react';
import { User, Sliders, Camera, Save, Lock, Moon, Bell, Loader2 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Configuracoes() {
  const { user, setUser } = useContext(AuthContext); 
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [loading, setLoading] = useState(false);

  const [formPerfil, setFormPerfil] = useState({
    nome: user?.name || '',
    oab: user?.oab || '',
  });

  const [formSenha, setFormSenha] = useState({
    current_password: '', password: '', password_confirmation: ''
  });

  const [preferencias, setPreferencias] = useState(user?.preferencias || {
    resumo_matinal: true, alertas_urgentes: true, tema: 'claro'
  });

  // 👇 MODO APRESENTAÇÃO: SIMULA ATUALIZAÇÃO DE PERFIL 👇
  async function handleSavePerfil(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, name: formPerfil.nome, oab: formPerfil.oab };
      setUser(updatedUser); 
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  }

  // 👇 MODO APRESENTAÇÃO: SIMULA MUDANÇA DE SENHA 👇
  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (formSenha.password !== formSenha.password_confirmation) {
      return toast.error("As novas senhas não coincidem!");
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Senha alterada com sucesso!");
      setFormSenha({ current_password: '', password: '', password_confirmation: '' });
    } catch (error) {
      toast.error("Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  }

  // 👇 MODO APRESENTAÇÃO: SIMULA SALVAR PREFERÊNCIAS 👇
  async function handleSavePreferencias() {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const updatedUser = { ...user, preferencias };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success("Preferências salvas!");
    } catch (error) {
      toast.error("Erro ao salvar preferências.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) setFormPerfil({ nome: user.name || user.nome || '', oab: user.oab || '' });
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-sm text-slate-500">Gerencie sua conta e preferências de uso.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button onClick={() => setAbaAtiva('perfil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'perfil' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}>
            <User size={18} /> Meu Perfil
          </button>
          <button onClick={() => setAbaAtiva('preferencias')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${abaAtiva === 'preferencias' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Sliders size={18} /> Preferências
          </button>
        </div>

        <div className="flex-1">
          {abaAtiva === 'perfil' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <form onSubmit={handleSavePerfil} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Informações Pessoais</h2>
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-3">
                    <label className="cursor-pointer group relative">
                      <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl border-4 border-white shadow-lg overflow-hidden">
                        {formPerfil.nome.charAt(0) || 'U'}
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={24} className="text-white" /></div>
                      </div>
                    </label>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                      <input type="text" required className="w-full mt-1 border-slate-200 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formPerfil.nome} onChange={e => setFormPerfil({...formPerfil, nome: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Número da OAB</label>
                      <input type="text" className="w-full mt-1 border-slate-200 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formPerfil.oab} onChange={e => setFormPerfil({...formPerfil, oab: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                      <input type="email" disabled className="w-full mt-1 border-slate-200 border rounded-lg p-2.5 bg-slate-50 text-slate-500" value={user?.email || 'admin@lexsaas.com'} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
                  <button type="submit" disabled={loading} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          )}

          {abaAtiva === 'preferencias' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2"><Moon size={20} className="text-indigo-500"/> Tema Visual</h2>
                <div className="flex gap-4">
                  <button onClick={() => setPreferencias({...preferencias, tema: 'claro'})} className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${preferencias.tema === 'claro' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200'}`}>Tema Claro</button>
                  <button disabled className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed">Tema Escuro (Em breve)</button>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4"><Bell size={20} className="text-amber-500"/> Notificações</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div><p className="font-bold text-slate-700 text-sm">Resumo Matinal</p><p className="text-xs text-slate-500">Receber e-mail às 08h com tarefas do dia.</p></div>
                    <input type="checkbox" checked={preferencias.resumo_matinal} onChange={e => setPreferencias({...preferencias, resumo_matinal: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
                <button onClick={handleSavePreferencias} disabled={loading} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700">
                  <Save size={18} /> Salvar Preferências
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}