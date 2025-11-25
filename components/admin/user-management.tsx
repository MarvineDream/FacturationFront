"use client"

import { useState, useEffect } from "react"
import { userApi, type User } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Trash2, Power } from "lucide-react"
import { CreateUserDialog } from "./create-user-dialog"

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  const loadUsers = async () => {
    setLoading(true)
    const response = await userApi.getAll()
    if (response.success && response.data) {
      setUsers(response.data)
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de charger les utilisateurs",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleStatus = async (userId: string) => {
    const response = await userApi.toggleStatus(userId)
    if (response.success) {
      toast({
        title: "Succès",
        description: "Statut de l'utilisateur modifié",
      })
      loadUsers()
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de modifier le statut",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return
    }

    const response = await userApi.delete(userId)
    if (response.success) {
      toast({
        title: "Succès",
        description: "Utilisateur supprimé",
      })
      loadUsers()
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      })
    }
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>Créer, modifier et gérer les comptes utilisateurs</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "Utilisateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(user.id)}>
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateUserDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={loadUsers} />
    </>
  )
}
