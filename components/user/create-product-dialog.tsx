"use client"

import type React from "react"
import { useState } from "react"
import { productApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    const parsedPrice = Number.parseFloat(price)
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast({
        title: "Prix invalide",
        description: "Veuillez entrer un prix numérique valide.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await productApi.create({
        name,
        description,
        price: parsedPrice,
      })

      if (!response.success) {
        throw new Error(response.error || "Erreur inconnue")
      }

      toast({
        title: "Succès",
        description: "Produit créé avec succès.",
      })

      setName("")
      setDescription("")
      setPrice("")
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message ?? "Impossible de créer le produit.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={loading ? () => {} : onOpenChange}>
      <DialogContent className="w-full max-w-md">
        {/* ===== HEADER ===== */}
        <DialogHeader>
          <DialogTitle>Nouveau produit</DialogTitle>
          <DialogDescription>
            Ajoutez un produit ou un service à votre catalogue.
          </DialogDescription>
        </DialogHeader>

        {/* ===== FORM ===== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom du produit / service</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price">Prix unitaire (Fcfa)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
