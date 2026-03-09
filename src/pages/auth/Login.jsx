import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck, Scale, CheckCircle2, Info } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('@LexSaaS:rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);     
      setRememberMe(true);      
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signIn(email, password);
      if (rememberMe) {
        localStorage.setItem('@LexSaaS:rememberedEmail', email);
      } else {
        localStorage.removeItem('@LexSaaS:rememberedEmail');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 sm:bg-slate-50 sm:dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 xl:px-24 bg-white dark:bg-slate-900 relative shadow-2xl z-10 animate-in fade-in slide-in-from-left-8 duration-500">
        
        <div className="absolute top-6 left-6 sm:top-8 sm:left-12 xl:left-24 flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md transition-colors">
            <Scale size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Lex<span className="text-indigo-600 dark:text-indigo-400">SaaS</span></span>
        </div>

        <div className="w-full max-w-sm mx-auto mt-16 sm:mt-0">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Bem-vindo de volta</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Gira o seu escritório de forma inteligente.</p>

          {/* AVISO PARA FUNCIONÁRIOS */}
          <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-xl flex gap-3 items-start transition-colors">
            <Info className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs font-medium text-sky-800 dark:text-sky-300 leading-relaxed">
              <strong>É funcionário ou estagiário?</strong> Peça os seus dados de acesso ao administrador do seu escritório.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-2xl flex items-start gap-3 animate-in fade-in transition-colors">
              <AlertCircle size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">E-mail corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600" />
                </div>
                <input type="email" required className="block w-full pl-12 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none shadow-sm" placeholder="adv@escritorio.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Senha</label>
                <Link to="/esqueci-senha" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 text-xs">Esqueceu a senha?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600" />
                </div>
                <input type={showPassword ? 'text' : 'password'} required className="block w-full pl-12 pr-12 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none shadow-sm" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center ml-1">
              <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded cursor-pointer" />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">Manter sessão iniciada</label>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-4 px-4 mt-4 rounded-2xl shadow-xl shadow-indigo-600/20 text-sm font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Aceder ao Sistema'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Deseja cadastrar um novo escritório?{' '}
            <Link to="/cadastro" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Clique aqui</Link>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: BRANDING */}
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