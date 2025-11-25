"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authApi, type User } from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        const response = await authApi.getCurrentUser()
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)

    if (response.success && response.data) {
      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)

      // Redirect based on role
      if (response.data.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }

      return { success: true }
    }

    return { success: false, error: response.error }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    router.push("/login")
  }

  const isAdmin = user?.role === "admin"

  return <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
