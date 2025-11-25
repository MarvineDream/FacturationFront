"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { clientApi, productApi, invoiceApi, type Client, type Product, type InvoiceItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

export function CreateInvoice() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [taxRate, setTaxRate] = useState("20")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [clientsRes, productsRes] = await Promise.all([clientApi.getAll(), productApi.getAll()])

    if (clientsRes.success && clientsRes.data) {
      setClients(clientsRes.data)
    }
    if (productsRes.success && productsRes.data) {
      setProducts(productsRes.data)
    }
  }

  const addItem = () => {
    if (products.length === 0) {
      toast({
        title: "Attention",
        description: "Veuillez d'abord créer des produits",
        variant: "destructive",
      })
      return
    }

    const firstProduct = products[0]
    setItems([
      ...items,
      {
        productId: firstProduct.id,
        productName: firstProduct.name,
        quantity: 1,
        unitPrice: firstProduct.price,
        total: firstProduct.price,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].productName = product.name
        newItems[index].unitPrice = product.price
        newItems[index].total = product.price * newItems[index].quantity
      }
    } else if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }

    setItems(newItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = (subtotal * Number.parseFloat(taxRate)) / 100
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un article",
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
      taxRate: Number.parseFloat(taxRate),
      taxAmount,
      total,
      issueDate,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
      status: "draft",
    })

    if (response.success) {
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de créer la facture",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            {/* 🔥 LOGO ENTREPRISE */}
            <div className="h-10 w-auto flex items-center">
                          <Image
                            src="/logo.png"
                            alt="Bamboo Assur Logo"
                            width={120}
                            height={40}
                            priority
                          />
                        </div>

            <div>
              <h1 className="text-xl font-bold">Nouvelle facture</h1>
              <p className="text-sm text-muted-foreground">
                Créez une nouvelle facture pour vos clients
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Date Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Sélectionnez le client et les dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Date d'émission</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance (optionnel)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Articles</CardTitle>
                  <CardDescription>Ajoutez les produits ou services à facturer</CardDescription>
                </div>
                <Button type="button" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit/Service</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(index, "productId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
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
                              updateItem(index, "quantity", Number.parseInt(e.target.value))
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(index, "unitPrice", Number.parseFloat(e.target.value))
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
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Totals */}
              {items.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total HT:</span>
                      <span className="font-medium">{subtotal.toFixed(2)} Fcfa</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TVA ({taxRate}%):</span>
                      <span className="font-medium">{taxAmount.toFixed(2)} Fcfa</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total TTC:</span>
                      <span>{total.toFixed(2)} Fcfa</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes (optionnel)</CardTitle>
              <CardDescription>Ajoutez des notes ou conditions de paiement</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Paiement sous 30 jours, conditions particulières..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
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
