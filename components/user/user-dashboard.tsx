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
      {/* HEADER */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* LEFT : Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-auto flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="Bamboo Assur Logo"
                width={130}
                height={40}
                priority
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">
                Tableau de bord
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Bienvenue, {user?.name}
              </p>
            </div>
          </div>

          {/* RIGHT : Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="px-3"
              onClick={() => router.push("/dashboard/create-invoice")}
            >
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">
                Nouvelle facture
              </span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="px-3"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">
                Déconnexion
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
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
