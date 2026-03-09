import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, User, Briefcase, Info, Scale, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Cadastro() {
  const [form, setForm] = useState({ nome_escritorio: '', name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signUp(form);
      toast.success("Escritório registado com sucesso!");
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar a conta. Verifique se o e-mail já existe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 sm:bg-slate-50 sm:dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 xl:px-24 bg-white dark:bg-slate-900 relative shadow-2xl z-10 animate-in fade-in slide-in-from-left-8 duration-500 transition-colors py-12 overflow-y-auto">
        
        <div className="absolute top-6 left-6 sm:top-8 sm:left-12 xl:left-24 flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md transition-colors">
            <Scale size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Lex<span className="text-indigo-600 dark:text-indigo-400">SaaS</span></span>
        </div>

        <div className="w-full max-w-sm mx-auto mt-12 sm:mt-0">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Registar Escritório</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Crie a sua conta de Administrador (Sócio).</p>

          {/* ALERTA PARA FUNCIONÁRIOS */}
          <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-2xl flex items-start gap-3 transition-colors">
            <Info size={20} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-sky-800 dark:text-sky-300 leading-relaxed">
              <strong>Atenção:</strong> Apenas para <strong>novos escritórios</strong>. Se você é funcionário, peça o acesso ao seu administrador.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-2xl flex items-start gap-3 transition-colors">
              <AlertCircle size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Nome do Escritório</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600" />
                </div>
                <input type="text" required className="block w-full pl-12 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none shadow-sm" placeholder="Ex: Silva & Associados" value={form.nome_escritorio} onChange={e => setForm({...form, nome_escritorio: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Seu Nome (Responsável)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600" />
                </div>
                <input type="text" required className="block w-full pl-12 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none shadow-sm" placeholder="Doutor(a) João da Silva" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">E-mail</label>
                <input type="email" required className="block w-full px-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white shadow-sm outline-none" placeholder="adv@escritorio.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Criar Senha</label>
                <input type="password" required minLength={8} className="block w-full px-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white shadow-sm outline-none" placeholder="Mín. 8 caracteres" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-4 px-4 mt-6 rounded-2xl shadow-xl shadow-indigo-600/20 text-sm font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Criar Conta e Escritório'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Já possui uma conta? <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Fazer Login</Link></p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: BRANDING (BANNER) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center relative overflow-hidden p-12 xl:p-24 transition-colors">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse"></div>
        <div className="relative z-10 text-white animate-in fade-in slide-in-from-right-8 duration-700">
          <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-6">Eleve a gestão do seu escritório a um novo patamar.</h1>
          <p className="text-lg text-slate-300 mb-10 max-w-md font-medium leading-relaxed">Automatize fluxos, controle prazos fatais com precisão e ofereça uma experiência premium aos seus clientes.</p>
          <div className="space-y-5">
            {[
              { text: "Sincronização com DataJud e Tribunais", color: "indigo" },
              { text: "Gestão inteligente de GED e Documentos", color: "sky" },
              { text: "Gestão Financeira e Controlo de Honorários", color: "rose" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm w-fit">
                <CheckCircle2 className={`text-${feature.color}-400`} size={24} />
                <span className="text-slate-200 font-bold">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}