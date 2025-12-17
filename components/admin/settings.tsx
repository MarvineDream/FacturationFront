"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { settingsApi } from "@/lib/api"

export function Settings() {
  const [taxRate, setTaxRate] = useState("20")
  const [invoicePrefix, setInvoicePrefix] = useState("FAC")
  const [footerText, setFooterText] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const { toast } = useToast()

  /* ===================== LOAD ===================== */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsApi.get()

        if (res.success && res.data) {
          setTaxRate(String(res.data.taxRate))
          setInvoicePrefix(res.data.invoicePrefix)
          setFooterText(res.data.footerText || "")
        }
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les paramètres",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  /* ===================== SAVE ===================== */
  const handleSave = async () => {
    if (!invoicePrefix.trim()) {
      toast({
        title: "Erreur",
        description: "Le préfixe de facture est obligatoire",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const res = await settingsApi.update({
        taxRate: Number(taxRate),
        invoicePrefix: invoicePrefix.toUpperCase(),
        footerText,
      })

      if (!res.success) {
        throw new Error(res.error)
      }

      toast({
        title: "Succès",
        description: "Paramètres enregistrés avec succès",
      })
    } catch (err: any) {
      toast({
        title: "Erreur",
        description:
          err.message || "Impossible d'enregistrer les paramètres",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de facturation</CardTitle>
          <CardDescription>
            Configurez les paramètres globaux du système
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* TVA */}
            <div className="space-y-2">
              <Label htmlFor="taxRate">Taux de TVA par défaut (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>

            {/* Préfixe */}
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
              <Input
                id="invoicePrefix"
                value={invoicePrefix}
                onChange={(e) =>
                  setInvoicePrefix(e.target.value.toUpperCase())
                }
                placeholder="FAC"
              />
              <p className="text-sm text-muted-foreground">
                Format : {invoicePrefix}-0001, {invoicePrefix}-0002
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="space-y-2 mt-6">
            <Label htmlFor="footerText">Pied de page des factures</Label>
            <Textarea
              id="footerText"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Mentions légales, coordonnées bancaires, etc."
              rows={4}
            />
          </div>

          {/* SAVE */}
          <div className="pt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Enregistrement..." : "Enregistrer les paramètres"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
