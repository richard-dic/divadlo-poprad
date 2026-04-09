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

  if (role === "ADMIN" && isAdmin) {
    return (
      <>
        <AdminBar />
        <AdminHeader />
      </>
    )
  }

  if (role === "CONTROLLER" && isScan) {
    return <OperatorHeader role="CONTROLLER" area="scan" />
  }

  if (
    (role === "SELLER_INTERNAL" || role === "SELLER_EXTERNAL") &&
    isSeller
  ) {
    return <OperatorHeader role={role} area="seller" />
  }

  if (role === "ADMIN") {
    return (
      <>
        <PreviewBar />
        <PublicHeader />
      </>
    )
  }

  return <PublicHeader />
}