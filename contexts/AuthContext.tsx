"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getTokenSync,
  getUserSync,
  removeToken,
  setToken,
  setUser,
  StoredUser,
} from "@/utils/token";

interface AuthContextType {
  token: string | null;
  user: StoredUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: StoredUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<StoredUser | null>(null);

  useEffect(() => {
    const storedToken = getTokenSync();
    const storedUser = getUserSync();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
  }, []);

  const login = (newToken: string, newUser: StoredUser) => {
    setToken(newToken);
    setUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
