"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Erreur de connexion")
      setLoading(false)
    }
  }

  // Chapeau visible uniquement en décembre
  const isChristmas = new Date().getMonth() === 11

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">

          {/* LOGO + CHAPEAU */}
          <div className="flex justify-center mb-4">
            <div className="relative bg-white rounded-lg shadow-sm p-3">

              {/* LOGO */}
              <Image
                src="/logo.png"
                alt="Bamboo Assur Logo"
                width={150}
                height={50}
                className="h-auto"
                priority
              />

              {/* CHAPEAU DE NOËL */}
              {isChristmas && (
                <Image
                  src="/santa-hat.png"
                  alt="Chapeau de Noël"
                  width={60}
                  height={60}
                  className="absolute -top-4 -right-4 rotate-12 pointer-events-none"
                />
              )}
            </div>
          </div>

          <CardTitle className="text-2xl font-bold">
            Logiciel de Facturation
          </CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour continuer
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
