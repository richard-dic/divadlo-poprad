import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ProgramPage() {

  const now = new Date()
  const o24hodin = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const terminy = await prisma.terminHrania.findMany({
    where: {
      zrusene: false,
      datumCas: {
        gte: o24hodin
      }
    },
    include: {
      inscenacia: true,
      hall: true
    },
    orderBy: {
      datumCas: "asc"
    }
  })

  const dni = [
    "NEDEĽA","PONDELOK","UTOROK","STREDA",
    "ŠTVRTOK","PIATOK","SOBOTA"
  ]

  const mesiace = [
    "JANUÁR","FEBRUÁR","MAREC","APRÍL","MÁJ","JÚN",
    "JÚL","AUGUST","SEPTEMBER","OKTÓBER","NOVEMBER","DECEMBER"
  ]

  return (
    <div className="container section">

      <h1 className="pageTitle">
        Program divadla
      </h1>

      {terminy.length === 0 && (
        <p>Zatiaľ nie sú naplánované žiadne predstavenia.</p>
      )}

      {terminy.map((t, index) => {
        const date = new Date(t.datumCas)

        const mesiac = date.getMonth()

        const predosly = terminy[index - 1]
        const jeNovyMesiac =
          index === 0 ||
          new Date(predosly.datumCas).getMonth() !== mesiac

        const dayName = dni[date.getDay()]
        const datum = `${date.getDate()}.${date.getMonth() + 1}.`

        return (
          <div key={t.id}>

            {/* 🔥 MESIAC */}
            {jeNovyMesiac && (
              <h2 className="pageHeading" style={{ marginTop: 50 }}>
                {mesiace[mesiac]}
              </h2>
            )}

            <div className="programRow">

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

                <div
                  className="programTitle desktopOnly"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 250
                  }}
                >
                  {t.inscenacia.nazov}
                </div>
              </div>

              <div
                className="programMiddle mobileOnly"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {t.inscenacia.nazov}
              </div>

              <div className="programBottom programRight">
                <div className="programHall">
                  {t.hall?.nazov}
                </div>

                <div style={{ display: "flex", gap: 10 }}>

                  <Link href={`/inscenacie/${t.inscenacia.id}`}>
                    <button className="secondaryBtn">
                      Detail
                    </button>
                  </Link>

                  <Link href={`/terminy/${t.id}/kupit`}>
                    <button className="buyBtn">
                      Kúpiť lístok
                    </button>
                  </Link>

                </div>
              </div>

            </div>

          </div>
        )
      })}

    </div>
  )
}