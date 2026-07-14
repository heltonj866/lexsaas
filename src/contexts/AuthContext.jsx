import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
 // 👈 Adicionado para a chamada direta do CSRF

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Motor de tema
  const [theme, setTheme] = useState(localStorage.getItem('@Iuris:theme') || 'escuro');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'escuro') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('@Iuris:theme', theme);
  }, [theme]);

  const toggleTheme = (novoTema) => setTheme(novoTema);


  useEffect(() => {
    // 🔒 MEGA BRAIN: Fetch user from secure HttpOnly cookie session via /me
    api.get('/me')
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signIn = async (email, password) => {
    // 1. Pré-flight CSRF (Obrigatório para Sanctum SPA)
    await api.get(`http://${window.location.hostname}:8000/sanctum/csrf-cookie`);
    
    // 2. Login (O Backend agora envia HttpOnly Cookie)
    const response = await api.post('/login', { email, password });
    
    // O Cookie 'laravel_session' e 'XSRF-TOKEN' já estão no navegador!
    setUser(response.data.user);
  };

  const signUp = async (dados) => {
    await api.get(`http://${window.location.hostname}:8000/sanctum/csrf-cookie`);
    const response = await api.post('/register', dados);
    setUser(response.data.user);
  };

  const signOut = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
    }
    
    // O Sanctum invalida a sessão no servidor. Limpamos o state.
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