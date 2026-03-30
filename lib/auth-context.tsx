"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, MOCK_USERS } from "./mock-data";

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  switchRole: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUserId = localStorage.getItem("cg_user_id");
    if (storedUserId) {
      const found = MOCK_USERS.find(u => u.id === storedUserId);
      if (found) setUser(found);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      localStorage.setItem("cg_user_id", found.id);
    } else {
      // fallback to Employee 1 if not found for demo
      setUser(MOCK_USERS[0]);
      localStorage.setItem("cg_user_id", MOCK_USERS[0].id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cg_user_id");
  };

  const switchRole = () => {
    if (!user) return;
    const newRole = user.role === "employee" ? "manager" : "employee";
    const newUser = MOCK_USERS.find(u => u.role === newRole);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem("cg_user_id", newUser.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, isLoading }}>
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
