'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  switchUser: (role: UserRole) => void;
  login: (email?: string) => void;
  logout: () => void;
  allUsers: User[];
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-alex',
    organizationId: 'org-acme',
    name: 'Alex Johnson',
    email: 'alex@acme.com',
    role: 'Admin',
    siteId: 'site-plant-a',
    status: 'Active',
  },
  {
    id: 'usr-sarah',
    organizationId: 'org-acme',
    name: 'Sarah Williams',
    email: 'sarah@acme.com',
    role: 'Supervisor',
    siteId: 'site-plant-b',
    status: 'Active',
  },
  {
    id: 'usr-james',
    organizationId: 'org-acme',
    name: 'James Okoro',
    email: 'james@acme.com',
    role: 'Technician',
    siteId: 'site-plant-a',
    status: 'Active',
  },
  {
    id: 'usr-taylor',
    organizationId: 'org-acme',
    name: 'Taylor K.',
    email: 'taylor@acme.com',
    role: 'Operator',
    siteId: 'site-plant-a',
    status: 'Active',
  },
];

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  switchUser: () => {},
  login: () => {},
  logout: () => {},
  allUsers: DEFAULT_USERS,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_USERS[0]); // Default to Alex Johnson (Admin)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('exceptionos_user');
    const authStatus = localStorage.getItem('exceptionos_auth');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        setCurrentUser(DEFAULT_USERS[0]);
      }
    }
    if (authStatus !== null) {
      setIsAuthenticated(authStatus === 'true');
    }
  }, []);

  const switchUser = (role: UserRole) => {
    const found = DEFAULT_USERS.find((u) => u.role === role) || DEFAULT_USERS[0];
    setCurrentUser(found);
    setIsAuthenticated(true);
    localStorage.setItem('exceptionos_user', JSON.stringify(found));
    localStorage.setItem('exceptionos_auth', 'true');
  };

  const login = (email?: string) => {
    const found = email ? DEFAULT_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) : null;
    const user = found || DEFAULT_USERS[0];
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('exceptionos_user', JSON.stringify(user));
    localStorage.setItem('exceptionos_auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('exceptionos_auth', 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        switchUser,
        login,
        logout,
        allUsers: DEFAULT_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
