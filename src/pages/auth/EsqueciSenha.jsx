import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, Scale, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // O mesmo URL base do backend que usamos no contexto
  const backendBaseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // 1. Puxamos o cookie de segurança do Sanctum
      await axios.get(`${backendBaseURL}/sanctum/csrf-cookie`, { withCredentials: true });
      
      // 2. Enviamos o pedido de recuperação para a API do Laravel
      await api.post('/forgot-password', { email });
      
      setSuccess(true);
      toast.success("Se o e-mail existir, receberá um link de recuperação.");
      
    } catch (err) {
      // Mesmo que o e-mail não exista, por segurança, sistemas modernos
      // costumam dar a mesma mensagem de sucesso para evitar "Email Enumeration"
      // Mas podemos capturar erros de servidor aqui.
      setError(err.response?.data?.message || 'Ocorreu um erro ao processar o seu pedido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 sm:bg-slate-50 sm:dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 xl:px-24 bg-white dark:bg-slate-900 relative shadow-2xl shadow-slate-200/50 dark:shadow-none z-10 animate-in fade-in slide-in-from-left-8 duration-500 transition-colors py-12">
        
        {/* Logo no topo */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-12 xl:left-24 flex items-center gap-2">
          <div className="bg-slate-900 dark:bg-indigo-600 p-2 rounded-xl shadow-md transition-colors">
            <Scale size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Lex<span className="text-indigo-600 dark:text-indigo-400">SaaS</span></span>
        </div>

        <div className="w-full max-w-sm mx-auto mt-12 sm:mt-0">
          
          {/* Botão de Voltar */}
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-8 transition-colors">
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Recuperar Senha</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Digite o e-mail associado ao seu escritório. Enviaremos um link seguro para redefinir a sua senha.
          </p>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-2xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {success ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl text-center animate-in zoom-in duration-300">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">E-mail Enviado!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Verifique a sua caixa de entrada (e a pasta de spam) de <strong>{email}</strong> para redefinir a sua senha.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">O seu E-mail</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    type="email" required
                    className="block w-full pl-12 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none shadow-sm"
                    placeholder="doutor@escritorio.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 mt-6 rounded-2xl shadow-xl shadow-indigo-600/20 text-sm font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar link de recuperação'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* LADO DIREITO: BRANDING CONSISTENTE */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between relative overflow-hidden p-12 xl:p-24">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-sky-500/20 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }}></div>

        <div className="relative z-10 text-white mt-16 animate-in fade-in slide-in-from-right-8 duration-700">
          <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-6 tracking-tight">
            A segurança do seu escritório em primeiro lugar.
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-md font-medium leading-relaxed">
            Utilizamos as melhores práticas de encriptação para garantir que apenas você e a sua equipa acedem aos processos.
          </p>
        </div>
      </div>

    </div>
  );
}