import PublicHeader from "@/components/headers/PublicHeader"
import PreviewBar from "@/components/PreviewBar"
import { getCurrentUserServer } from "@/lib/auth/getCurrentUserServer"

export default async function PublicLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserServer()

  return (
    <>
      {/*len admin vidí preview */}
      {user?.role === "ADMIN" && <PreviewBar />}

      <PublicHeader />

      {children}
    </>
  )
}