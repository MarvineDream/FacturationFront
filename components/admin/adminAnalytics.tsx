"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts"

/* ================= TYPES ALIGNÉS BACKEND ================= */

type BestCustomer = {
  name: string
  totalSpent: number
  percentage: number
}

type TrendPoint = {
  label: string
  value: number
}

type BackendAnalytics = {
  revenue: number
  totalSales: number

  totalClients: number
  newClients: number

  bestCustomer: BestCustomer | null
  topProduct: string

  revenueTrend: TrendPoint[]
  newClientsTrend: TrendPoint[]

  topProducts: { name: string; sales: number }[]
}

export function AdminAnalytics() {
  const [period, setPeriod] = useState("month")
  const [data, setData] = useState<BackendAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          setError("Utilisateur non authentifié")
          return
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/factures/analytics/admin?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.message || "Erreur serveur")
        }

        const json = await res.json()
        setData(json.data)
      } catch (e: any) {
        setError(e.message || "Impossible de charger les données")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  if (loading) return <p>Chargement des données…</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!data) return <p>Aucune donnée disponible</p>

  /* ================= CALCULS ================= */

  const panierMoyen =
    data.totalSales > 0
      ? Math.round(data.revenue / data.totalSales)
      : 0

  const tauxAcquisition =
    data.totalClients > 0
      ? Math.round((data.newClients / data.totalClients) * 100)
      : 0

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">

      {/* ---------- FILTRE ---------- */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Journalier</SelectItem>
            <SelectItem value="week">Hebdomadaire</SelectItem>
            <SelectItem value="month">Mensuel</SelectItem>
            <SelectItem value="quarter">Trimestriel</SelectItem>
            <SelectItem value="year">Annuel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ---------- KPI ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <Card>
          <CardHeader>
            <CardTitle>Chiffre d’affaires</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data.revenue.toLocaleString()} FCFA
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSales}</div>
            <div className="text-xs text-muted-foreground">
              Panier moyen : {panierMoyen.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalClients}</div>
            <div className="text-xs text-muted-foreground">
              +{data.newClients} nouveaux ({tauxAcquisition}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meilleur client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {data.bestCustomer ? (
              <>
                <div className="font-semibold">
                  {data.bestCustomer.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {data.bestCustomer.totalSpent.toLocaleString()} FCFA
                </div>
                <div className="text-xs font-medium text-blue-600">
                  {data.bestCustomer.percentage}% du CA
                </div>
                {data.bestCustomer.percentage > 50 && (
                  <div className="text-xs text-orange-600">
                    ⚠ Forte dépendance client
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meilleure vente</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {data.topProduct}
          </CardContent>
        </Card>
      </div>

      {/* ---------- CA ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du chiffre d’affaires</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} FCFA`} />
              <Line type="monotone" dataKey="value" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ---------- NOUVEAUX CLIENTS ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des nouveaux clients</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.newClientsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ---------- TOP PRODUITS ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Top produits</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  )
}
