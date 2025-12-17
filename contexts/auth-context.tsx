"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { authApi, type User } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 CHARGE L'UTILISATEUR VIA /me
  const loadUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch {
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 AU MOUNT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // 🔹 LOGIN PROPRE
  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    localStorage.setItem("token", response.data.token);

    // ⛔ NE PAS setUser ici
    await loadUser(); // ✅ source unique

    const role = response.data.user.role;
    router.push(role === "admin" ? "/admin" : "/dashboard");

    return { success: true };
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
