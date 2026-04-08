import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ✅ ADMIN POST (bez limitu)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const terminId = Number(body.terminId)
    const hallSeatId = Number(body.hallSeatId)
    const sessionId = String(body.sessionId || "").trim()

    if (!terminId || !hallSeatId || !sessionId) {
      return NextResponse.json({ error: "Chýbajú údaje" }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.$transaction(async (tx) => {
      // 🧹 cleanup expired
      await tx.reservationSeat.deleteMany({
        where: {
          terminId,
          hallSeatId,
          expiresAt: { lt: now }
        }
      })

      const existingReservation = await tx.reservationSeat.findFirst({
        where: {
          terminId,
          hallSeatId,
          status: "RESERVED",
          expiresAt: { gt: now }
        }
      })

      if (existingReservation) {
        throw new Error("Miesto je už rezervované")
      }

      const soldTicket = await tx.ticket.findFirst({
        where: {
          seatId: hallSeatId,
          order: { terminId }
        }
      })

      if (soldTicket) {
        throw new Error("Miesto je už predané")
      }

      await tx.reservationSeat.create({
        data: {
          terminId,
          hallSeatId,
          sessionId,
          status: "RESERVED",
          expiresAt
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    let message = "Chyba rezervácie"

    if (error instanceof Error) {
      message = error.message
    }

    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// ✅ ADMIN DELETE (toto ti chýbalo)
export async function DELETE(request: Request) {
  try {
    const body = await request.json()

    const terminId = Number(body.terminId)
    const hallSeatId = Number(body.hallSeatId)
    const sessionId = String(body.sessionId || "").trim()

    if (!terminId || !hallSeatId || !sessionId) {
      return NextResponse.json({ error: "Chýbajú údaje" }, { status: 400 })
    }

    await prisma.reservationSeat.deleteMany({
      where: {
        terminId,
        hallSeatId,
        sessionId,
        status: "RESERVED"
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    let message = "Chyba zrušenia rezervácie"

    if (error instanceof Error) {
      message = error.message
    }

    return NextResponse.json({ error: message }, { status: 400 })
  }
}