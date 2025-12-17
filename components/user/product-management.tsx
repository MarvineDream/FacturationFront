"use client"

import { useState, useEffect } from "react"
import { productApi, type Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
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
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Edit } from "lucide-react"
import { CreateProductDialog } from "./create-product-dialog"

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  const loadProducts = async () => {
    setLoading(true)
    const response = await productApi.getAll()
    if (response.success && response.data) {
      setProducts(response.data)
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de charger les produits",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return

    const response = await productApi.delete(productId)
    if (response.success) {
      toast({
        title: "Succès",
        description: "Produit supprimé",
      })
      loadProducts()
    } else {
      toast({
        title: "Erreur",
        description: response.error || "Impossible de supprimer le produit",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Mes produits et services</CardTitle>
              <CardDescription>
                Gérez vos produits et services
              </CardDescription>
            </div>

            <Button
              className="w-full sm:w-auto"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau produit
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* CONTENEUR RESPONSIVE OBLIGATOIRE */}
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      Aucun produit trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>

                      <TableCell>
                        {product.description || "-"}
                      </TableCell>

                      <TableCell>
                        {product.price.toFixed(2)} Fcfa
                      </TableCell>

                      <TableCell className="text-right">
                        {/* BOUTONS RESPONSIVE */}
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <Edit className="h-4 w-4 sm:mr-2" />
                            <span className="sm:hidden">Modifier</span>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() =>
                              handleDeleteProduct(product.id)
                            }
                          >
                            <Trash2 className="h-4 w-4 sm:mr-2" />
                            <span className="sm:hidden">Supprimer</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateProductDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadProducts}
      />
    </>
  )
}
