import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isLoading: boolean;
  isSignedIn: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Verificar si hay token al iniciar
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsSignedIn(!!token);
      } catch (e) {
        console.error('Error checking token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();

    // Escuchar cambios en AsyncStorage (cuando se hace login/logout)
    const interval = setInterval(() => {
      checkToken();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setIsSignedIn(false);
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, isSignedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
