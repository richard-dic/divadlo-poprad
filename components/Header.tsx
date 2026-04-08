"use client"

import { usePathname } from "next/navigation"
import AdminHeader from "./headers/AdminHeader"
import PublicHeader from "./headers/PublicHeader"
import OperatorHeader from "./headers/OperatorHeader"
import PreviewBar from "./PreviewBar"

type Role =
  | "ADMIN"
  | "CONTROLLER"
  | "SELLER_INTERNAL"
  | "SELLER_EXTERNAL"
  | null

export default function Header({ role }: { role: Role }) {
  const pathname = usePathname()

  const isAdminPage = pathname.startsWith("/admin")
  const isScanPage =
    pathname.startsWith("/scan") ||
    pathname.startsWith("/controller")

  const isSellerPage =
    pathname.startsWith("/predaj") ||
    pathname.startsWith("/predaj-external")

  if (role === "ADMIN" && isAdminPage) {
    return <AdminHeader />
  }

  if (role === "CONTROLLER" && isScanPage) {
    return <OperatorHeader role={role} area="scan" />
  }

  if (
    (role === "SELLER_INTERNAL" ||
      role === "SELLER_EXTERNAL") &&
    isSellerPage
  ) {
    return <OperatorHeader role={role} area="seller" />
  }

  if (role === "ADMIN" && !isAdminPage) {
    return (
      <>
        <PreviewBar />
        <PublicHeader />
      </>
    )
  }

  return <PublicHeader />
}