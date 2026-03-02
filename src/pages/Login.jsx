import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

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
    const savedEmail = localStorage.getItem('@SeuApp:rememberedEmail');
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
        localStorage.setItem('@SeuApp:rememberedEmail', email);
      } else {
        localStorage.removeItem('@SeuApp:rememberedEmail');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      
      {/* LADO ESQUERDO: FORMULÁRIO DE LOGIN */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 bg-white relative">
        
        {/* Logo no topo */}
        <div className="absolute top-8 left-8 sm:left-16 xl:left-24 flex items-center gap-2">
          <div className="bg-slate-900 p-2 rounded-lg">
            <Scale size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Lex<span className="text-indigo-600">SaaS</span></span>
        </div>

        <div className="w-full max-w-sm mx-auto mt-12 lg:mt-0">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Bem-vindo de volta</h2>
          <p className="text-sm text-slate-500 mb-6">
            Acesse seu painel de controle e gerencie seu escritório de forma inteligente.
          </p>

          {/* 👇 AVISO DE MODO DEMONSTRAÇÃO 👇 */}
          <div className="mb-6 bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
            <AlertCircle size={20} className="text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-sky-800">Modo de Demonstração</h4>
              <p className="text-xs text-sky-600 mt-1 leading-relaxed">
                Ambiente de testes. Preencha qualquer e-mail para aceder à interface do sistema. Não é necessária uma senha real.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* E-MAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email" required
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-slate-50 focus:bg-white outline-none"
                  placeholder="advogado@escritorio.com.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* SENHA */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Senha de acesso</label>
                <Link to="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'} required
                  className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-slate-50 focus:bg-white outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* LEMBRAR DE MIM */}
            <div className="flex items-center">
              <input
                id="remember-me" type="checkbox"
                checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                Lembrar minhas credenciais
              </label>
            </div>

            {/* BOTÃO SUBMIT */}
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md shadow-indigo-200/50 text-sm font-bold text-white bg-slate-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Acessar o Sistema'}
            </button>
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Ambiente seguro e criptografado.</span>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between relative overflow-hidden p-12 xl:p-24">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-sky-500/20 blur-3xl"></div>

        <div className="relative z-10 text-white mt-12">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Eleve a gestão do seu escritório a um novo patamar.
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-md">
            Automatize fluxos, controle prazos fatais com precisão e ofereça uma experiência premium aos seus clientes.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-indigo-400" />
              <span className="text-slate-200 font-medium">Sincronização com DataJud e Tribunais</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-indigo-400" />
              <span className="text-slate-200 font-medium">Gestão inteligente de GED e Documentos</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-indigo-400" />
              <span className="text-slate-200 font-medium">Inteligência Artificial Integrada</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}