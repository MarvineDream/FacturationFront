"use client"

import { useState, useEffect } from "react"
import { clientApi, type Client } from "@/lib/api"
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

interface EditClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  onSuccess: () => void
}

export function EditClientDialog({ open, onOpenChange, client, onSuccess }: EditClientDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Remplir les champs au moment où le client change
  useEffect(() => {
    if (client) {
      setName(client.name)
      setEmail(client.email)
      setPhone(client.phone || "")
      setAddress(client.address || "")
    }
  }, [client])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    setLoading(true)

    const response = await clientApi.update(client.id, {
      name,
      email,
      phone,
      address,
    })

    if (response.success) {
      toast({
        title: "Succès",
        description: "Client modifié avec succès",
      })
      onOpenChange(false)
      onSuccess()
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de modifier le client",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>Mettez à jour les informations du client</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
