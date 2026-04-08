import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ScanDashboard() {
  const terminy = await prisma.terminHrania.findMany({
    include: {
      inscenacia: true,
      hall: true,

      // 🔥 počet predaných
      objednavky: {
        select: {
          _count: {
            select: {
              tickets: true
            }
          }
        }
      }
    },
    orderBy: {
      datumCas: "asc"
    }
  })

  const now = new Date()

  const upcoming = terminy
    .filter(t => new Date(t.datumCas) >= now)
    .sort((a, b) => new Date(a.datumCas).getTime() - new Date(b.datumCas).getTime())

  const past = terminy
    .filter(t => new Date(t.datumCas) < now)
    .sort((a, b) => new Date(b.datumCas).getTime() - new Date(a.datumCas).getTime())

  return (
    <div className="adminContainer">
      <h1 className="headingPrimary" style={{ marginBottom: 30 }}>
        Kontrola vstupeniek
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}
      >
        {await Promise.all(
          upcoming.map(async (t) => {
            const sold = t.objednavky.reduce(
              (sum, o) => sum + o._count.tickets,
              0
            )

            const checked = await prisma.ticket.count({
              where: {
                order: {
                  terminId: t.id
                },
                usedAt: {
                  not: null
                }
              }
            })

            const occupancy = Math.round((checked / (sold || 1)) * 100)

            return (
              <div
                key={t.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 18,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {t.inscenacia.nazov}
                  </div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {new Date(t.datumCas).toLocaleDateString("sk-SK")} {new Date(t.datumCas).toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    {t.hall.nazov}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    fontSize: 14
                  }}
                >
                  <div>
                    <b>Predané:</b> {sold}
                  </div>
                  <div>
                    <b>Skontrolované:</b> {checked}
                  </div>
                  <div>
                    <b>%:</b> {occupancy}
                  </div>
                </div>

                <Link
                  href={`/scan/${t.id}`}
                  className="primaryBtn"
                  style={{ textDecoration: "none" }}
                >
                  Skenovať
                </Link>
              </div>
            )
          })
        )}

        {past.length > 0 && (
          <>
            <h2 className="headingSecondary" style={{ marginTop: 30, marginBottom: 10 }}>
              Už odohrané
            </h2>

            {await Promise.all(
              past.map(async (t) => {
                const sold = t.objednavky.reduce(
                  (sum, o) => sum + o._count.tickets,
                  0
                )

                const checked = await prisma.ticket.count({
                  where: {
                    order: {
                      terminId: t.id
                    },
                    usedAt: {
                      not: null
                    }
                  }
                })

                const occupancy = Math.round((checked / (sold || 1)) * 100)

                return (
                  <div
                    key={`past-${t.id}`}
                    style={{
                      background: "#f8f8f8",
                      borderRadius: 12,
                      padding: 18,
                      boxShadow: "0 6px 15px rgba(0,0,0,0.04)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 16,
                      opacity: 0.7
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>
                        {t.inscenacia.nazov}
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {new Date(t.datumCas).toLocaleDateString("sk-SK")} {new Date(t.datumCas).toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ fontSize: 13, color: "#888" }}>
                        {t.hall.nazov}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        alignItems: "center",
                        fontSize: 14
                      }}
                    >
                      <div>
                        <b>Predané:</b> {sold}
                      </div>
                      <div>
                        <b>Skontrolované:</b> {checked}
                      </div>
                      <div>
                        <b>%:</b> {occupancy}
                      </div>
                    </div>

                    <Link
                      href={`/scan/${t.id}`}
                      className="primaryBtn"
                      style={{ textDecoration: "none" }}
                    >
                      Skenovať
                    </Link>
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}