"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { CreateInvoice } from "@/components/user/create-invoice"

export default function CreateInvoicePage() {
  return (
    <ProtectedRoute>
      <CreateInvoice />
    </ProtectedRoute>
  )
}
