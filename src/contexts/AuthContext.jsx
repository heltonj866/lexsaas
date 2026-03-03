import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👇 MOTOR DE TEMA DEFINITIVO 👇
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

  const toggleTheme = (novoTema) => {
    setTheme(novoTema);
  };
  // 👆 FIM DO MOTOR DE TEMA 👆

  useEffect(() => {
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const userResponse = {
      id: 1, nome: 'Sócio LexSaaS', email: email || 'demonstracao@lexsaas.com', role: 'socio'
    };
    const token = 'token-falso-de-demonstracao-12345';
    
    localStorage.setItem('user', JSON.stringify(userResponse));
    localStorage.setItem('token', token);
    setUser(userResponse);
  };

  const signOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    api.defaults.headers.Authorization = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      authenticated: !!user, user, setUser, loading, signIn, signOut,
      theme, toggleTheme // <-- Exportamos o tema e a função de mudar
    }}>
      {children}
    </AuthContext.Provider>
  );
}