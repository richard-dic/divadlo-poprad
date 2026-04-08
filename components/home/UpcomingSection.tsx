import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"

export default async function UpcomingSection() {
  const now = new Date()

  const terminy = await prisma.terminHrania.findMany({
    where: {
      datumCas: { gte: now },
      zrusene: false,
      inscenacia: { viditelna: true }
    },
    include: { inscenacia: true },
    orderBy: { datumCas: "asc" }
  })

  const seen = new Set<number>()
  const upcoming: typeof terminy = []

  for (const t of terminy) {
    if (!seen.has(t.inscenacia.id)) {
      seen.add(t.inscenacia.id)
      upcoming.push(t)
    }
    if (upcoming.length === 4) break
  }

  return (
    <div style={{ marginTop: 60 }}>
      <h1 className="headingPrimary">
        NAJBLIŽŠIE PREDSTAVENIA
      </h1>

      <div className="upcomingRow">
        {upcoming.map((t: (typeof upcoming)[number], i: number) => {
          const item = t.inscenacia

          return (
            <Link
              key={item.id}
              href={`/inscenacie/${item.id}`}
              className="upcomingCard"
              style={{
                transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`
              }}
            >
              <div className="upcomingInner">
                <Image
                  src={item.coverImage || "/default.jpg"}
                  alt={item.nazov}
                  fill
                  className="upcomingImage"
                />

                <div className="upcomingOverlay">
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 4
                    }}
                  >
                    {item.nazov}
                  </div>

                  <div style={{ fontSize: 12 }}>
                    DETAIL
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}