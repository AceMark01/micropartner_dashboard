import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { FaviconUpdater } from "@/components/favicon-updater"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Micropartner Dashboard - Analytics & Reports",
  description: "Comprehensive analytics dashboard for micropartner data with filtering and visualization",
  generator: "v0.app",
  icons: {
    icon: "/ace-logo.jpg",
    apple: "/ace-logo.jpg", // Using the same logo for apple touch icon for consistency
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <FaviconUpdater />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
