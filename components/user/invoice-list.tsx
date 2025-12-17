"use client"

import { useState, useEffect, useMemo } from "react"
import { invoiceApi, type Invoice } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Download, Eye, Search, RefreshCcw } from "lucide-react"
import { useRouter } from "next/navigation"

/* ===================== STATUS FR ===================== */
const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)

  const { toast } = useToast()
  const router = useRouter()

  /* ===================== LOAD ===================== */
  const loadInvoices = async () => {
    setLoading(true)
    const res = await invoiceApi.getAll()

    if (res.success && res.data) {
      setInvoices(res.data)
    } else {
      toast({
        title: "Erreur",
        description: res.error || "Impossible de charger les factures",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  /* ===================== FILTER ===================== */
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  /* ===================== PDF ===================== */
  const handleDownloadPdf = async (invoice: Invoice) => {
    if (downloadingId) return

    try {
      setDownloadingId(invoice.id)
      const blob = await invoiceApi.downloadPdf(invoice.id)
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${invoice.invoiceNumber}.pdf`
      a.click()

      URL.revokeObjectURL(url)
    } catch {
      toast({
        title: "Erreur",
        description: "Téléchargement impossible",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  /* ===================== STATUS ===================== */
  const handleToggleStatus = async (invoice: Invoice) => {
    if (updatingStatusId) return

    const nextStatus =
      invoice.status === "draft"
        ? "sent"
        : invoice.status === "sent"
        ? "paid"
        : "draft"

    try {
      setUpdatingStatusId(invoice.id)

      const res = await invoiceApi.updateStatus(invoice.id, nextStatus)
      if (!res.success) throw new Error()

      toast({
        title: "Statut mis à jour",
        description: `Nouveau statut : ${STATUS_LABELS[nextStatus]}`,
      })

      loadInvoices()
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatusId(null)
    }
  }

  /* ===================== CSV ===================== */
  const exportToCSV = () => {
    const escape = (v: any) => `"${String(v).replace(/"/g, '""')}"`

    const headers = [
      "Numéro",
      "Client",
      "Date",
      "HT",
      "TVA",
      "TTC",
      "Statut",
    ]

    const rows = filteredInvoices.map((i) => [
      escape(i.invoiceNumber),
      escape(i.client?.name || ""),
      escape(new Date(i.issueDate).toLocaleDateString("fr-FR")),
      escape(i.subtotal.toFixed(2)),
      escape(i.taxAmount.toFixed(2)),
      escape(i.total.toFixed(2)),
      escape(STATUS_LABELS[i.status]),
    ])

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `factures_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()

    URL.revokeObjectURL(url)
  }

  /* ===================== UI ===================== */
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Mes factures</CardTitle>
            <CardDescription>Historique de facturation</CardDescription>
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher numéro ou client"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="sent">Envoyée</SelectItem>
              <SelectItem value="paid">Payée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{invoice.client?.name}</TableCell>
                  <TableCell>
                    {new Date(invoice.issueDate).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>{invoice.total.toFixed(2)} Fcfa</TableCell>

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
                      {STATUS_LABELS[invoice.status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/dashboard/invoice/${invoice.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloadingId === invoice.id}
                        onClick={() => handleDownloadPdf(invoice)}
                      >
                        {downloadingId === invoice.id ? (
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={updatingStatusId === invoice.id}
                        onClick={() => handleToggleStatus(invoice)}
                      >
                        {updatingStatusId === invoice.id
                          ? "Mise à jour..."
                          : "Changer le statut"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
