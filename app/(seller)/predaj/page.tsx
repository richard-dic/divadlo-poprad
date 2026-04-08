import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"

export default async function PredajPage() {
  const user = await getCurrentUser()

  if (!user) {
    return <div>Neautorizovaný prístup</div>
  }

  const terminy = await prisma.terminHrania.findMany({
    include: {
      inscenacia: true,
      hall: true
    },
    orderBy: {
      datumCas: "asc"
    }
  })

  const isExternal = user.role === "SELLER_EXTERNAL"
  const isInternal =
    user.role === "ADMIN" ||
    user.role === "CONTROLLER" ||
    user.role === "SELLER_INTERNAL"

  const now = new Date()

  const upcoming = terminy
    .filter(t => new Date(t.datumCas) >= now)
    .sort((a, b) => new Date(a.datumCas).getTime() - new Date(b.datumCas).getTime())

  const past = terminy
    .filter(t => new Date(t.datumCas) < now)
    .sort((a, b) => new Date(b.datumCas).getTime() - new Date(a.datumCas).getTime())

  return (
    <div className="adminContainer" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 className="headingPrimary" style={{ marginBottom: 30 }}>
        {isExternal ? "Externý predaj / rezervácie" : "Predaj vstupeniek"}
      </h1>

      {user.role === "CONTROLLER" && (
        <div style={{ marginBottom: 20 }}>
          <Link href="/scan" style={{ color: "var(--primary)", fontWeight: 600 }}>
            ← Späť na kontrolu vstupeniek
          </Link>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          gap: 20
        }}
      >
        {upcoming.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "stretch"
            }}
          >
            <div>
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                {t.inscenacia.nazov}
              </h3>

              <div style={{ marginBottom: 6 }}>
                <span style={{ color: "#666" }}>
                  {new Date(t.datumCas).toLocaleString("sk-SK")}
                </span>
              </div>

              <div style={{ marginBottom: 0 }}>
                <span style={{ color: "#666" }}>
                  {t.hall.nazov}
                </span>
              </div>
              <div style={{ color: "#999", fontSize: 13 }}>
                Voľné / predané: — / —
              </div>

              {isExternal && (
                <div style={{ color: "#666", fontSize: 14 }}>
                  rezervácia bez úhrady
                </div>
              )}

              {isInternal && !isExternal && (
                <div style={{ color: "#666", fontSize: 14 }}>
                  predaj na mieste
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link
                href={`/predaj/${t.id}`}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: "var(--primary)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600
                }}
              >
                Prejsť na predaj
              </Link>
            </div>
          </div>
        ))}

        {past.length > 0 && (
          <>
            <div style={{ gridColumn: "1 / -1", marginTop: 20 }}>
              <h2 className="headingSecondary" style={{ marginBottom: 10 }}>
                Už odohrané
              </h2>
            </div>

            {past.map((t) => (
              <div
                key={`past-${t.id}`}
                style={{
                  background: "#f8f8f8",
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: "0 6px 15px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  opacity: 0.7
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                    {t.inscenacia.nazov}
                  </h3>

                  <div style={{ marginBottom: 6, color: "#666" }}>
                    {new Date(t.datumCas).toLocaleString("sk-SK")}
                  </div>

                  <div style={{ color: "#666" }}>
                    {t.hall.nazov}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}