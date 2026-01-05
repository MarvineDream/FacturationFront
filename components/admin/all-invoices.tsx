"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Download, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 10

export function AllInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(invoices.length / PAGE_SIZE)

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return invoices.slice(start, end)
  }, [invoices, currentPage])

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
              {paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Aucune facture trouvée
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => {
                  const date = new Date(
                    invoice.issueDate
                  ).toLocaleDateString("fr-FR")
                  const amount = Number(invoice.total || 0).toFixed(2)

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

                      <TableCell>{amount} FCFA</TableCell>

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
                          disabled={downloadingId === invoice.id}
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

        {/* ================= PAGINATION FOOTER ================= */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
