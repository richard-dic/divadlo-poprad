import PublicHeader from "@/components/headers/PublicHeader"
import PreviewBar from "@/components/PreviewBar"
import Footer from "@/components/Footer"
import { getCurrentUserServer } from "@/lib/auth/getCurrentUserServer"

export default async function PublicLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserServer()

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {user?.role === "ADMIN" && <PreviewBar />}

      <PublicHeader />

      {/* 🔥 hlavný obsah */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* 🔥 footer vždy dole */}
      <Footer />
    </div>
  )
}