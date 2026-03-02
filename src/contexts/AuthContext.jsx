import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoveredUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (recoveredUser && token) {
      setUser(JSON.parse(recoveredUser));
      // Mantemos o token no Axios apenas por precaução, mesmo sem backend
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Se não houver tema definido, o padrão é 'claro'
    const tema = user?.preferencias?.tema || 'claro';
    
    if (tema === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.preferencias?.tema]); 

  // FUNÇÃO DE LOGIN MODIFICADA PARA APRESENTAÇÃO
  const signIn = async (email, password) => {
    
    // Simulamos um carregamento de 1.5 segundos para parecer real
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Criamos um utilizador fictício com o e-mail que a pessoa digitar
    const userResponse = {
      id: 1,
      nome: 'Sócio LexSaaS', 
      email: email || 'demonstracao@lexsaas.com',
      tenant_id: 1,
      role: 'socio',
      preferencias: { tema: 'claro' }
    };
    
    const token = 'token-falso-de-demonstracao-12345';

    // Guardamos no navegador para manter a sessão ativa se a pessoa atualizar a página
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
      authenticated: !!user, 
      user, 
      setUser, 
      loading, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}