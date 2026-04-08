import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { SeatType } from "@prisma/client"

export async function GET() {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) return auth

  const terminy = await prisma.terminHrania.findMany({
    include: {
      inscenacia: true,
      hall: {
        include: {
          seats: true
        }
      },
      objednavky: {
        include: {
          tickets: true
        }
      }
    },
    orderBy: {
      datumCas: "asc"
    }
  })

  const result = terminy.map((t) => {
    const relevantSeats = t.hall.seats.filter((seat) => {
      if (t.hall.nazov === "Veľká sála") {
        return seat.typMiesta === SeatType.ROW_SEAT
      }

      if (t.hall.nazov === "Štúdio") {
        if (t.typSedenia === "TABLES") {
          return seat.typMiesta === SeatType.TABLE_SEAT
        }

        if (t.typSedenia === "ROWS") {
          return seat.typMiesta === SeatType.ROW_SEAT
        }

        if (t.typSedenia === "KIDS") {
          return (
            seat.typMiesta === SeatType.CHAIR ||
            seat.typMiesta === SeatType.CHILD_SEAT
          )
        }
      }

      return true
    })

    const capacity = relevantSeats.length

    const paidOrders = t.objednavky.filter((o) => o.status === "PAID")

    const sold = paidOrders.reduce((sum, o) => {
      return sum + o.tickets.length
    }, 0)

    const revenue = paidOrders.reduce((sum, o) => {
      return sum + (o.totalAmount ?? 0)
    }, 0)

    return {
      id: t.id,
      nazov: t.inscenacia.nazov,
      datumCas: t.datumCas,
      capacity,
      sold,
      free: capacity - sold,
      revenue
    }
  })

  return NextResponse.json(result)
}