"use client"

import { usePathname } from "next/navigation"
import AdminHeader from "./headers/AdminHeader"
import PublicHeader from "./headers/PublicHeader"
import OperatorHeader from "./headers/OperatorHeader"
import PreviewBar from "./PreviewBar"
import AdminBar from "./AdminBar"

type Role =
  | "ADMIN"
  | "CONTROLLER"
  | "SELLER_INTERNAL"
  | "SELLER_EXTERNAL"
  | null

export default function AppChrome({ role }: { role: Role }) {
  const pathname = usePathname()

  const isAdmin = pathname.startsWith("/admin")
  const isScan = pathname.startsWith("/scan")
  const isSeller = pathname.startsWith("/predaj")

  // 🔥 ADMIN ROZHRANIE
  if (role === "ADMIN" && isAdmin) {
    return (
      <>
        <AdminBar />
        <AdminHeader />
      </>
    )
  }

  // 🔥 CONTROLLER
  if (role === "CONTROLLER" && isScan) {
    return <OperatorHeader type="controller" />
  }

  // 🔥 SELLER
  if (
    (role === "SELLER_INTERNAL" || role === "SELLER_EXTERNAL") &&
    isSeller
  ) {
    return <OperatorHeader type="seller" />
  }

  // 🔥 ADMIN NA PUBLIC (preview)
  if (role === "ADMIN") {
    return (
      <>
        <PreviewBar />
        <PublicHeader />
      </>
    )
  }

  // 🔥 PUBLIC USER
  return <PublicHeader />
}