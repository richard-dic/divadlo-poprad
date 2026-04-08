import { prisma } from "@/lib/prisma"
import SeatMap from "@/components/SeatMap"
import { SeatType, Prisma } from "@prisma/client"

export default async function KupitListok({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  const termin = await prisma.terminHrania.findUnique({
    where: { id },
    include: {
      inscenacia: true,
      hall: true
    }
  })

  if (!termin) {
    return <div>Termín neexistuje</div>
  }

  // ✅ typované správne (žiadne any)
  const seatFilter: Prisma.HallSeatWhereInput = {
    hallId: termin.hallId
  }

  if (termin.hall.nazov === "Veľká sála") {
    seatFilter.typMiesta = SeatType.ROW_SEAT
  }

  if (termin.hall.nazov === "Štúdio") {
    if (termin.typSedenia === "TABLES") {
      seatFilter.typMiesta = SeatType.TABLE_SEAT
    }

    if (termin.typSedenia === "ROWS") {
      seatFilter.typMiesta = SeatType.ROW_SEAT
    }

    if (termin.typSedenia === "KIDS") {
      seatFilter.typMiesta = {
        in: [SeatType.CHAIR, SeatType.CHILD_SEAT]
      }
    }
  }

  const seats = await prisma.hallSeat.findMany({
    where: seatFilter,
    orderBy: [
      { rad: "asc" },
      { cislo: "asc" },
      { stol: "asc" },
      { stolicka: "asc" }
    ]
  })

  const activeReservations = await prisma.reservationSeat.findMany({
    where: {
      terminId: id,
      status: "RESERVED",
      expiresAt: {
        gt: new Date()
      }
    },
    select: {
      hallSeatId: true
    }
  })

  const soldTickets = await prisma.ticket.findMany({
    where: {
      order: {
        terminId: id
      }
    },
    select: {
      seatId: true
    }
  })

  const reservedSeats = [
    ...activeReservations.map((r) => r.hallSeatId),
    ...soldTickets.map((t) => t.seatId)
  ]

  return (
    <div className="container section">

      <h1 className="headingPrimary" style={{ marginBottom: 0 }}>
        {termin.inscenacia.nazov}
      </h1>

      <div
        className="metaInfo"
        style={{
          marginTop: 0,
          marginBottom: 30,
          color: "var(--color-text-muted)",
          display: "flex",
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div>
          <b>DÁTUM:</b> {new Date(termin.datumCas).toLocaleDateString("sk-SK")}
        </div>

        <div>
          <b>ČAS:</b> {new Date(termin.datumCas).toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
        </div>

        <div>
          <b>PRIESTOR:</b> {termin.hall.nazov}
        </div>
      </div>

      <SeatMap
        seats={seats}
        terminId={id}
        reservedSeats={reservedSeats}
      />


    <style>{`
      @media (max-width: 600px) {
        .metaInfo {
          font-size: 11px !important;
          gap: 5px;
        }
      }
    `}</style>
    </div>
  )
}