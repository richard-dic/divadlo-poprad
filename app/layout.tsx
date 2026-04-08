import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import "@/styles/variables.css"
import { initApp } from "@/lib/startup"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-main",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Divadlo",
  description: "Rezervačný systém"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  initApp()

  return (
    <html lang="sk">
      <body className={`${plusJakartaSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}