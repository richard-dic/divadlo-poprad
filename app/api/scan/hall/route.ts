import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { SeatType } from "@prisma/client"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER", "SELLER_INTERNAL", "SELLER_EXTERNAL"])

  if (auth instanceof Response) {
    return auth
  }

  const { terminId } = await req.json()

  const termin = await prisma.terminHrania.findUnique({
    where: { id: Number(terminId) },
    include: { hall: true }
  })

  if (!termin) {
    return NextResponse.json(
      { error: "Termín neexistuje" },
      { status: 404 }
    )
  }

  let whereClause: {
    hallId: number
    typMiesta?: SeatType | { in: SeatType[] }
  } = {
    hallId: termin.hallId
  }

  if (termin.hall.nazov === "Veľká sála") {
    whereClause = {
      hallId: termin.hallId,
      typMiesta: SeatType.ROW_SEAT
    }
  }

  if (termin.hall.nazov === "Štúdio" && termin.typSedenia === "TABLES") {
    whereClause = {
      hallId: termin.hallId,
      typMiesta: SeatType.TABLE_SEAT
    }
  }

  if (termin.hall.nazov === "Štúdio" && termin.typSedenia === "ROWS") {
    whereClause = {
      hallId: termin.hallId,
      typMiesta: SeatType.ROW_SEAT
    }
  }

  if (termin.hall.nazov === "Štúdio" && termin.typSedenia === "KIDS") {
    whereClause = {
      hallId: termin.hallId,
      typMiesta: {
        in: [SeatType.CHAIR, SeatType.CHILD_SEAT]
      }
    }
  }

  const seats = await prisma.hallSeat.findMany({
    where: whereClause,
    include: {
      tickets: {
        where: {
          order: {
            terminId: Number(terminId)
          }
        }
      }
    },
    orderBy: [
      { rad: "asc" },
      { cislo: "asc" },
      { stol: "asc" },
      { stolicka: "asc" }
    ]
  })

  const result = seats.map((seat) => {
    let status: "FREE" | "SOLD" | "CHECKED" = "FREE"

    if (seat.tickets.length > 0) {
      const ticket = seat.tickets[0]
      status = ticket.usedAt ? "CHECKED" : "SOLD"
    }

    return {
      id: seat.id,
      rad: seat.rad,
      cislo: seat.cislo,
      stol: seat.stol,
      stolicka: seat.stolicka,
      typMiesta: seat.typMiesta,
      status
    }
  })

  return NextResponse.json({
    hallName: termin.hall.nazov,
    typSedenia: termin.typSedenia,
    seatPrice: termin.zakladnaCena,
    seats: result
  })
}