import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"
import Snow from "@/components/Snow"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Logiciel de Facturation Bamboo Assur",
  description: "Gestion de facturation pour professionnels libéraux",
  generator: "Marvine Corp",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {/* ❄️ Neige globale */}
          <Snow />

          {children}
          <Toaster />
        </AuthProvider>

        <Analytics />
      </body>
    </html>
  )
}
