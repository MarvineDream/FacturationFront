"use client"

import { useState, useEffect } from "react"
import { invoiceApi, type Invoice } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, FileText } from "lucide-react"

interface InvoiceDetailProps {
  invoiceId: string
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadInvoice()
  }, [invoiceId])

  const loadInvoice = async () => {
    setLoading(true)
    const response = await invoiceApi.getById(invoiceId)
    if (response.success && response.data) {
      setInvoice(response.data)
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de charger la facture",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleDownloadPdf = async () => {
    if (!invoice) return

    try {
      const blob = await invoiceApi.downloadPdf(invoice.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${invoice.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Succès",
        description: "Facture téléchargée",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la facture",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Facture introuvable</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Facture {invoice.invoiceNumber}</h1>
              <p className="text-sm text-muted-foreground">Détails de la facture</p>
            </div>
          </div>
          <Button onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Invoice Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informations générales</CardTitle>
              <Badge
                variant={invoice.status === "paid" ? "default" : invoice.status === "sent" ? "secondary" : "outline"}
              >
                {invoice.status === "paid" ? "Payée" : invoice.status === "sent" ? "Envoyée" : "Brouillon"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{invoice.client?.name || "N/A"}</p>
              {invoice.client?.email && <p className="text-sm text-muted-foreground">{invoice.client.email}</p>}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date d'émission</p>
              <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString("fr-FR")}</p>
            </div>
            {invoice.dueDate && (
              <div>
                <p className="text-sm text-muted-foreground">Date d'échéance</p>
                <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit/Service</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice.toFixed(2)} Fcfa</TableCell>
                    <TableCell className="text-right">{item.total.toFixed(2)} Fcfa</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT:</span>
                  <span className="font-medium">{invoice.subtotal.toFixed(2)} Fcfa</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA ({invoice.taxRate}%):</span>
                  <span className="font-medium">{invoice.taxAmount.toFixed(2)} Fcfa</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total TTC:</span>
                  <span>{invoice.total.toFixed(2)} Fcfa</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
