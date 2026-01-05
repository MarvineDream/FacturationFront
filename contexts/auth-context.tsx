"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authApi, type User } from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  /* ================= LOAD CURRENT USER ================= */

  const loadUser = async () => {
    try {
      const response = await authApi.getCurrentUser()

      if (response.success && response.data) {
        setUser(response.data)
      } else {
        throw new Error("Utilisateur non authentifié")
      }
    } catch {
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /* ================= ON APP MOUNT ================= */

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setLoading(false)
      return
    }

    loadUser()
  }, [])

  /* ================= LOGIN ================= */

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || "Identifiants invalides",
      }
    }

    // 🔐 Stocke le token
    localStorage.setItem("token", response.data.token)

    // 🔄 Recharge l'utilisateur depuis /me
    await loadUser()

    // 🔀 Redirection selon rôle
    const role = response.data.user.role
    router.push(role === "admin" ? "/admin" : "/dashboard")

    return { success: true }
  }

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token")
    authApi.logout()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: !!user && user.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* ================= HOOK ================= */

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
