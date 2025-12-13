"use client"

import { useState, useEffect } from "react"
import { invoiceApi, type Invoice } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Download, Eye, Search } from "lucide-react"
import { useRouter } from "next/navigation"

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [searchTerm, statusFilter, invoices])

  const loadInvoices = async () => {
    setLoading(true)
    const response = await invoiceApi.getAll()
    if (response.success && response.data) {
      setInvoices(response.data)
      setFilteredInvoices(response.data)
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de charger les factures",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const filterInvoices = () => {
    let filtered = [...invoices]

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await invoiceApi.downloadPdf(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${invoiceNumber}.pdf`
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

  const exportToCSV = () => {
    const headers = ["Numéro", "Client", "Date", "Montant HT", "TVA", "Montant TTC", "Statut"]
    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.client?.name || "N/A",
      new Date(invoice.issueDate).toLocaleDateString("fr-FR"),
      invoice.subtotal.toFixed(2),
      invoice.taxAmount.toFixed(2),
      invoice.total.toFixed(2),
      invoice.status === "paid" ? "Payée" : invoice.status === "sent" ? "Envoyée" : "Brouillon",
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `factures_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Succès",
      description: "Export CSV téléchargé",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mes factures</CardTitle>
            <CardDescription>Historique de toutes vos factures</CardDescription>
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            Exporter CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="sent">Envoyée</SelectItem>
              <SelectItem value="paid">Payée</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                  {searchTerm || statusFilter !== "all"
                    ? "Aucune facture ne correspond aux critères de recherche"
                    : "Aucune facture trouvée. Créez votre première facture pour commencer."}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.client?.name || "N/A"}</TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>{invoice.total.toFixed(2)} Fcfa</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "paid" ? "default" : invoice.status === "sent" ? "secondary" : "outline"
                      }
                    >
                      {invoice.status === "paid" ? "Payée" : invoice.status === "sent" ? "Envoyée" : "Brouillon"}
                    </Badge>
                  </TableCell>
 <TableCell className="text-right">
  <div className="flex justify-end gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push(`/dashboard/invoice/${invoice.id}`)}
    >
      <Eye className="h-4 w-4" />
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
    >
      <Download className="h-4 w-4" />
    </Button>

    {/* 🔄 Bouton modifier statut (uniquement draft <-> paid) */}
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        const nextStatus = invoice.status === "draft" ? "paid" : "draft";

        const res = await invoiceApi.updateStatus(invoice.id, nextStatus);

        if (res.success) {
          toast({
            title: "Statut mis à jour",
            description: `La facture est maintenant : ${nextStatus}`,
          });
          loadInvoices();
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de changer le statut",
            variant: "destructive",
          });
        }
      }}
    >
      {invoice.status === "draft" && "Marquer payée"}
      {invoice.status === "paid" && "Remettre brouillon"}
    </Button>
  </div>
</TableCell>


                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredInvoices.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {filteredInvoices.length} facture{filteredInvoices.length > 1 ? "s" : ""} trouvée
              {filteredInvoices.length > 1 ? "s" : ""}
            </p>
            <p className="text-sm font-medium">
              Total: {filteredInvoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)} Fcfa
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
