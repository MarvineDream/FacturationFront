"use client"

import { useState, useEffect } from "react"
import { invoiceApi, type Invoice } from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download } from "lucide-react"

export function AllInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const response = await invoiceApi.getAll()

      if (response.success && response.data) {
        setInvoices(response.data)
      } else {
        throw new Error(response.error || "Impossible de charger les factures")
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (
    invoiceId: string,
    invoiceNumber: string
  ) => {
    try {
      setDownloadingId(invoiceId)

      const blob = await invoiceApi.downloadPdf(invoiceId)
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la facture",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {/* ================= HEADER ================= */}
      <CardHeader>
        <CardTitle>Toutes les factures</CardTitle>
        <CardDescription>
          Vue d'ensemble de toutes les factures du système
        </CardDescription>
      </CardHeader>

      {/* ================= TABLE ================= */}
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">
                  Date
                </TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Aucune facture trouvée
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const date = new Date(
                    invoice.issueDate
                  ).toLocaleDateString("fr-FR")
                  const amount = Number(
                    invoice.total || 0
                  ).toFixed(2)

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>

                      <TableCell>
                        {invoice.client?.name || "N/A"}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {date}
                      </TableCell>

                      <TableCell>
                        {amount} Fcfa
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "sent"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {invoice.status === "paid"
                            ? "Payée"
                            : invoice.status === "sent"
                            ? "Envoyée"
                            : "Brouillon"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={
                            downloadingId === invoice.id
                          }
                          onClick={() =>
                            handleDownloadPdf(
                              invoice.id,
                              invoice.invoiceNumber
                            )
                          }
                        >
                          {downloadingId === invoice.id ? (
                            <div className="h-4 w-4 animate-spin border-b-2 rounded-full" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
