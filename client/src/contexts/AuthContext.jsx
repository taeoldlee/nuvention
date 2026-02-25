import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDemoUsers, demoLogin } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load demo users on mount
  useEffect(() => {
    getDemoUsers()
      .then((res) => setDemoUsers(res.data))
      .catch(() => setDemoUsers([]))
      .finally(() => setLoading(false));
  }, []);

  // Restore session from localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('locale_user_id');
    if (savedUserId) {
      demoLogin(savedUserId)
        .then((res) => {
          setUser(res.data.user);
          setProfile(res.data.profile);
        })
        .catch(() => {
          localStorage.removeItem('locale_user_id');
        });
    }
  }, []);

  const login = useCallback(async (userId) => {
    const res = await demoLogin(userId);
    localStorage.setItem('locale_user_id', userId);
    setUser(res.data.user);
    setProfile(res.data.profile);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('locale_user_id');
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const res = await demoLogin(user.id);
    setUser(res.data.user);
    setProfile(res.data.profile);
    return res.data;
  }, [user]);

  const value = {
    user,
    profile,
    demoUsers,
    loading,
    login,
    logout,
    refreshProfile,
    isOperator: user?.role === 'OPERATOR',
    isAgency: user?.role === 'AGENCY',
    hasProfile: !!profile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
