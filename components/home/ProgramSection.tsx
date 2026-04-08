import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ProgramSection() {
  const now = new Date()

    const o7dni = new Date()
    o7dni.setDate(now.getDate() + 7)

    const terminy = await prisma.terminHrania.findMany({
    where: {
        datumCas: {
        gte: now,
        lte: o7dni
        },
        zrusene: false
    },
    include: {
        inscenacia: true,
        hall: true,
        rezervacie: true
    },
    orderBy: {
        datumCas: "asc"
    },
    take: 6
    })

  const dni = [
    "NEDEĽA","PONDELOK","UTOROK","STREDA",
    "ŠTVRTOK","PIATOK","SOBOTA"
  ]

  return (
  <div style={{ marginTop: 60 }}>
    <h2 className="headingPrimary">
      PROGRAM TENTO TÝŽDEŇ
    </h2>

    {terminy.map((t) => {
      const date = new Date(t.datumCas)

      const dayName = dni[date.getDay()]
      const datum = `${date.getDate()}.${date.getMonth() + 1}.`

      const vypredane = false

      return (
        <div key={t.id} className="programRow">

          {/* TOP */}
          <div className="programTop programLeft">
            <div className="programDateBig">{datum}</div>
            <div className="programDay">{dayName}</div>
            <div className="programTime">
              {date.toLocaleTimeString("sk-SK", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>

            <div className="programDivider">|</div>

            {/* desktop názov */}
            <div className="programTitle desktopOnly">
              {t.inscenacia.nazov}
            </div>
          </div>

          {/* mobile názov */}
          <div className="programMiddle mobileOnly">
            {t.inscenacia.nazov}
          </div>

          {/* RIGHT */}
          <div className="programBottom programRight">
            <div className="programHall">
              {t.hall.nazov}
            </div>

            {vypredane ? (
              <button className="buyBtn soldOut">
                Vypredané
              </button>
            ) : (
              <Link href={`/terminy/${t.id}/kupit`}>
                <button className="buyBtn">
                  Kúpiť lístok
                </button>
              </Link>
            )}
          </div>

        </div>
      )
    })}
  </div>
)
}