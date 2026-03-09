import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, AlertCircle, Scale } from 'lucide-react';
import api from '../../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function RedefinirSenha() {
  // Captura os dados mágicos da URL (enviados pelo Laravel no e-mail)
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const backendBaseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validação extra no frontend
    if (password !== passwordConfirmation) {
      return setError('As senhas não coincidem. Tente novamente.');
    }

    try {
      setLoading(true);
      setError('');
      
      await axios.get(`${backendBaseURL}/sanctum/csrf-cookie`, { withCredentials: true });
      
      // Envia a nova senha junto com o token de segurança
      await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      
      toast.success("Senha redefinida com sucesso!");
      toast("Já pode aceder com a sua nova senha.", { icon: '🔐' });
      navigate('/login');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao redefinir a senha. O link pode ser inválido ou ter expirado.');
    } finally {
      setLoading(false);
    }
  }

  // Se a pessoa aceder à página sem um link de e-mail, mostramos um erro amigável
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Link Inválido</h2>
          <p className="text-slate-500 mt-2">Por favor, use o link enviado para o seu e-mail.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 sm:bg-slate-50 sm:dark:bg-slate-950 transition-colors duration-300">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 xl:px-24 bg-white dark:bg-slate-900 shadow-2xl z-10 py-12">
        
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="bg-slate-900 dark:bg-indigo-600 p-2 rounded-xl">
            <Scale size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">Lex<span className="text-indigo-600 dark:text-indigo-400">SaaS</span></span>
        </div>

        <div className="w-full max-w-sm mx-auto mt-12 sm:mt-0">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Criar Nova Senha</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Digite a sua nova senha para o utilizador <strong>{email}</strong>.
          </p>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nova Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-600" />
                </div>
                <input
                  type="password" required minLength={8}
                  className="block w-full pl-9 pr-3 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none"
                  placeholder="Mín. 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Confirmar Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-600" />
                </div>
                <input
                  type="password" required minLength={8}
                  className="block w-full pl-9 pr-3 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none"
                  placeholder="Repita a nova senha"
                  value={passwordConfirmation}
                  onChange={e => setPasswordConfirmation(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 mt-6 rounded-2xl shadow-xl shadow-indigo-600/20 text-sm font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Guardar Nova Senha'}
            </button>
          </form>
        </div>
      </div>

      {/* LADO DIREITO (Decorativo) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center relative overflow-hidden p-12 xl:p-24">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse"></div>
      </div>
    </div>
  );
}