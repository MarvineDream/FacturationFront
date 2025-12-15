"use client"

import { useState } from "react"
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

export function Settings() {
  const [taxRate, setTaxRate] = useState("20")
  const [invoicePrefix, setInvoicePrefix] = useState("FAC")
  const [footerText, setFooterText] = useState("")
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Succès",
      description: "Paramètres enregistrés",
    })
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
          {/* ✅ GRID RESPONSIVE */}
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

            {/* Préfixe facture */}
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
              <Input
                id="invoicePrefix"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="FAC"
              />
              <p className="text-sm text-muted-foreground">
                Format : {invoicePrefix}-0001, {invoicePrefix}-0002
              </p>
            </div>
          </div>

          {/* Pied de page */}
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

          {/* Bouton */}
          <div className="pt-6 flex justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={handleSave}
            >
              Enregistrer les paramètres
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
