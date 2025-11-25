"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { UserDashboard } from "@/components/user/user-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  )
}
