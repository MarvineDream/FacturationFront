"use client"

import Image from "next/image"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientManagement } from "./client-management"
import { ProductManagement } from "./product-management"
import { InvoiceList } from "./invoice-list"
import { FileText, Users, Package, LogOut, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("invoices")
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Bamboo Assur */}
            <div className="h-10 w-auto flex items-center">
              <Image
                src="/logo.png"
                alt="Bamboo Assur Logo"
                width={130}
                height={40}
                priority
              />
            </div>

            <div>
              <h1 className="text-xl font-bold">Tableau de bord</h1>
              <p className="text-sm text-muted-foreground">Bienvenue, {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => router.push("/dashboard/create-invoice")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle facture
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <InvoiceList />
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
