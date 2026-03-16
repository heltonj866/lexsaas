import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
 // 👈 Adicionado para a chamada direta do CSRF

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Motor de tema
  const [theme, setTheme] = useState(localStorage.getItem('@LexSaaS:theme') || 'claro');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'escuro') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('@LexSaaS:theme', theme);
  }, [theme]);

  const toggleTheme = (novoTema) => setTheme(novoTema);

  // URL raiz do Laravel (sem /api)
  const backendBaseURL = 'http://127.0.0.1:8000';

  useEffect(() => {
    // Agora busca pelas chaves corretas que estão no seu api.js
    const recoveredUser = localStorage.getItem('@LegalTech:user');
    const token = localStorage.getItem('@LegalTech:token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    // 👇 Removemos completamente o axios.get('/sanctum/csrf-cookie') daqui!
    
    // Vamos direto para a rota de login da sua API
    const response = await api.post('/login', { email, password });
    
    const { user, access_token } = response.data;
    
    localStorage.setItem('@LegalTech:user', JSON.stringify(user));
    localStorage.setItem('@LegalTech:token', access_token);
    
    api.defaults.headers.Authorization = `Bearer ${access_token}`;
    setUser(user);
  };

  const signUp = async (dados) => {
  
  const response = await api.post('/register', dados);
    const { user, access_token } = response.data;
    
    localStorage.setItem('@LegalTech:user', JSON.stringify(user));
    localStorage.setItem('@LegalTech:token', access_token);
    
    api.defaults.headers.Authorization = `Bearer ${access_token}`;
    setUser(user);
  };

  // 👇 Função reconstruída e atualizada 👇
  const signOut = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
    }
    
    // Limpa as chaves corretas do armazenamento local
    localStorage.removeItem('@LegalTech:user');
    localStorage.removeItem('@LegalTech:token');
    api.defaults.headers.Authorization = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      authenticated: !!user, user, setUser, loading, signIn, signUp, signOut,
      theme, toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
}