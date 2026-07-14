import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, Shield, Zap, BookOpen } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const FEATURES = [
  { icon: Shield, title: 'Segurança Máxima', desc: 'Documentos criptografados e sessões protegidas' },
  { icon: Zap, title: 'Gestão Inteligente', desc: 'Processos, clientes e prazos num só lugar' },
  { icon: BookOpen, title: 'Cofre Digital (GED)', desc: 'Acesso seguro a todos os documentos jurídicos' },
];

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
    const saved = localStorage.getItem('@Iuris:rememberedEmail');
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await signIn(email, password);
      if (rememberMe) localStorage.setItem('@Iuris:rememberedEmail', email);
      else localStorage.removeItem('@Iuris:rememberedEmail');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'E-mail ou senha incorretos.';
      const code = err.response?.data?.error_code;
      if (code === 'TRIAL_EXPIRED') {
        setError('Seu período de teste expirou. Entre em contato para assinar um plano.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#07091A' }}>

      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ background: '#07091A' }}>
        
        {/* Subtle, elegant grid background */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Decorative corner glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          {/* Logo Original */}
          <div className="mb-8 flex items-center justify-center">
             <img src="/logo.png" alt="IURIS Logo" className="w-48 lg:w-56 h-auto object-contain rounded-2xl" />
          </div>
          
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-12" style={{ color: '#64748B' }}>
            Software de Excelência Jurídica
          </p>
          
          <div className="space-y-4 w-full text-left">
            {/* eslint-disable-next-line no-unused-vars */}
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-2xl transition-colors hover:bg-white/[0.02]"
                style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="p-2 rounded-xl shrink-0" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                  <Icon size={16} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#CBD5E1' }}>{title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#475569' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-[10px] absolute bottom-8 uppercase tracking-widest font-semibold" style={{ color: '#1E293B' }}>
          © {new Date().getFullYear()} IURIS · Todos os direitos reservados
        </p>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 xl:px-20 relative"
        style={{ background: '#0D1117' }}>

        {/* Mobile logo */}
        <div className="flex lg:hidden flex-col items-center justify-center mb-8 w-full relative pt-6 pb-2">
          <img src="/logo.png" alt="IURIS Logo" className="w-40 h-auto object-contain rounded-xl mb-3" />
          <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: '#64748B' }}>
            SaaS Jurídico
          </span>
        </div>

        <div className="w-full max-w-sm animate-enter">
          <div className="mb-8">
            <h1 className="text-2xl font-black mb-1.5" style={{ color: '#F1F5F9', letterSpacing: '-0.03em' }}>
              Bem-vindo de volta
            </h1>
            <p className="text-sm" style={{ color: '#475569' }}>
              Entre com suas credenciais para continuar
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2.5"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
              <span className="shrink-0 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold block mb-1.5 tracking-wide uppercase" style={{ color: '#475569' }}>
                E-mail
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email"
                  placeholder="seu@email.com.br"
                  className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold block mb-1.5 tracking-wide uppercase" style={{ color: '#475569' }}>
                Senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-dark w-full pl-10 pr-12 py-3 rounded-xl text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#334155' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="sr-only peer" />
                  <div className="w-4 h-4 rounded border transition-all peer-checked:border-amber-500"
                    style={{ borderColor: rememberMe ? '#F59E0B' : '#1E293B', background: rememberMe ? 'rgba(245,158,11,0.15)' : 'transparent' }}>
                    {rememberMe && <div className="absolute inset-0.5 rounded-sm" style={{ background: '#F59E0B' }} />}
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: '#475569' }}>Lembrar e-mail</span>
              </label>

              <Link to="/esqueci-senha" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: '#F59E0B' }}>
                Esqueci a senha
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Entrando...' : 'Entrar no IURIS'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#334155' }}>
            Não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#F59E0B' }}>
              Teste grátis por 7 dias
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}