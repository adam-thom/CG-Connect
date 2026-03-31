"use client";

import React, { createContext, useContext, useState } from "react";
// Import Prisma's user type loosely or define it directly based on schema
import { User as PrismaUser } from "../src/generated/prisma/client";

interface AuthContextType {
  user: PrismaUser | any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode; 
  initialUser: any | null;
}) {
  // Pass the user directly bypassing trapped local `useState` initialization on NextJS Layout hydration transitions!
  return (
    <AuthContext.Provider value={{ user: initialUser }}>
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
