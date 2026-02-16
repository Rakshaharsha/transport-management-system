import { useState, useEffect } from 'react';
import {
  User,
  getCurrentUser,
  isAuthenticated,
  login as apiLogin,
  logout as apiLogout } from
'../utils/auth';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        setUser(getCurrentUser());
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string) => {
    try {
      const { user } = await apiLogin(email);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    navigate('/login');
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}