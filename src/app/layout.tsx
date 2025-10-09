import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/context/AuthContext"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/lib/context/ThemeContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SplitBillApp",
  description: "Monitor your incoming transactions and stay on top of your cash flow.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="64x64"/>
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
             <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
