"use client"

import { useState, useEffect } from "react"
import { clientApi, type Client } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Trash2, Edit } from "lucide-react"
import { CreateClientDialog } from "./create-client-dialog"
import { EditClientDialog } from "./client-edit-dialog"

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Nouveaux états pour l’édition
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)

  const { toast } = useToast()

  const loadClients = async () => {
    setLoading(true)
    const response = await clientApi.getAll()
    if (response.success && response.data) {
      setClients(response.data)
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de charger les clients",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return

    const response = await clientApi.delete(clientId)
    if (response.success) {
      toast({
        title: "Succès",
        description: "Client supprimé",
      })
      loadClients()
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de supprimer le client",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (client: Client) => {
    setClientToEdit(client)
    setShowEditDialog(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mes clients</CardTitle>
              <CardDescription>Gérez vos clients et leurs informations</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucun client trouvé. Créez votre premier client pour commencer.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell>{client.address || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(client.id)}>
                          <Trash2 className="h-4 w-4" />
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

      <CreateClientDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={loadClients} />

      <EditClientDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        client={clientToEdit}
        onSuccess={loadClients}
      />
    </>
  )
}
