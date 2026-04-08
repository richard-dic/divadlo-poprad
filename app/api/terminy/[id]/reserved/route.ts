import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const terminId = Number(resolvedParams.id)
    const { searchParams } = new URL(req.url)
    const sessionId = String(searchParams.get("sessionId") || "").trim()

    if (!terminId) {
      return NextResponse.json(
        { error: "Neplatné ID termínu" },
        { status: 400 }
      )
    }

    const reservations = await prisma.reservationSeat.findMany({
      where: {
        terminId,
        status: "RESERVED",
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        hallSeatId: true,
        sessionId: true
      }
    })

    const tickets = await prisma.ticket.findMany({
      where: {
        order: {
          terminId
        }
      },
      select: {
        seatId: true
      }
    })

    const myReservedSeatIds = reservations
      .filter((r) => r.sessionId === sessionId)
      .map((r) => r.hallSeatId)

    const reservedByOthersSeatIds = reservations
      .filter((r) => r.sessionId !== sessionId)
      .map((r) => r.hallSeatId)

    const soldSeatIds = tickets.map((t) => t.seatId)

    return NextResponse.json({
      myReservedSeatIds,
      reservedByOthersSeatIds,
      soldSeatIds
    })
  } catch (err) {
    console.error("RESERVED ERROR:", err)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}