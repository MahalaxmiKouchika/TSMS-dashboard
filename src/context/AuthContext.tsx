import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  id: number;
  admin_identifier: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  login: (admin: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAdmin(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (newAdmin: AdminUser) => {
    setAdmin(newAdmin);
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
