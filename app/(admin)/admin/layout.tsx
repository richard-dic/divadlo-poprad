import { getCurrentUserServer } from "@/lib/auth/getCurrentUserServer"
import { redirect } from "next/navigation"
import AdminBar from "@/components/AdminBar"
import AdminHeader from "@/components/headers/AdminHeader"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserServer()

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <>
      <AdminBar />
      <AdminHeader />
      {children}
    </>
  )
}