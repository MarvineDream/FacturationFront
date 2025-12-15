"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import {
  clientApi,
  productApi,
  invoiceApi,
  type Client,
  type Product,
  type InvoiceItem,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

export function CreateInvoice() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [taxRate, setTaxRate] = useState("20")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [clientsRes, productsRes] = await Promise.all([
      clientApi.getAll(),
      productApi.getAll(),
    ])

    if (clientsRes.success && clientsRes.data) setClients(clientsRes.data)
    if (productsRes.success && productsRes.data) setProducts(productsRes.data)
  }

  const addItem = () => {
    if (products.length === 0) {
      toast({
        title: "Aucun produit",
        description: "Veuillez d'abord créer un produit.",
        variant: "destructive",
      })
      return
    }

    const p = products[0]
    setItems((prev) => [
      ...prev,
      {
        productId: p.id,
        productName: p.name,
        quantity: 1,
        unitPrice: p.price,
        total: p.price,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productName = product.name
        updated[index].unitPrice = product.price
        updated[index].total = product.price * updated[index].quantity
      }
    }

    if (field === "quantity" || field === "unitPrice") {
      updated[index].total =
        updated[index].quantity * updated[index].unitPrice
    }

    setItems(updated)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const taxAmount = (subtotal * Number(taxRate)) / 100
    return { subtotal, taxAmount, total: subtotal + taxAmount }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId || items.length === 0) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez sélectionner un client et ajouter au moins un article.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const { subtotal, taxAmount, total } = calculateTotals()

    const response = await invoiceApi.create({
      clientId: selectedClientId,
      items,
      subtotal,
      taxRate: Number(taxRate),
      taxAmount,
      total,
      issueDate,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
      status: "draft",
    })

    setLoading(false)

    if (response.success) {
      toast({ title: "Facture créée avec succès" })
      router.push("/dashboard")
    } else {
      toast({
        title: "Erreur",
        description: response.error,
        variant: "destructive",
      })
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Image src="/logo.png" alt="Logo" width={120} height={40} />

          <div>
            <h1 className="text-xl font-bold">Nouvelle facture</h1>
            <p className="text-sm text-muted-foreground">
              Création d'une facture client
            </p>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* INFOS */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Client, dates et taxe</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Taxe (%)</Label>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>

              <div>
                <Label>Date d’émission</Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>

              <div>
                <Label>Date d’échéance</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* ARTICLES */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Articles</CardTitle>
                <CardDescription>Produits et services facturés</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Select
                            value={item.productId}
                            onValueChange={(v) => updateItem(i, "productId", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(i, "quantity", Number(e.target.value))
                            }
                            className="w-20"
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(i, "unitPrice", Number(e.target.value))
                            }
                            className="w-28"
                          />
                        </TableCell>

                        <TableCell className="font-medium">
                          {item.total.toFixed(2)} Fcfa
                        </TableCell>

                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(i)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {items.length > 0 && (
                <div className="mt-6 max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} Fcfa</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxe</span>
                    <span>{taxAmount.toFixed(2)} Fcfa</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span>{total.toFixed(2)} Fcfa</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NOTES */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Conditions, remarques…"
              />
            </CardContent>
          </Card>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer la facture"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
