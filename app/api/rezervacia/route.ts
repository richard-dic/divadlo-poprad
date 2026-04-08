import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const MAX_TICKETS_PER_SESSION = 6

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const terminId = Number(body.terminId)
    const hallSeatId = Number(body.hallSeatId)
    const sessionId = String(body.sessionId || "").trim()

    if (!terminId || !hallSeatId || !sessionId) {
      return NextResponse.json(
        { error: "Chýbajú údaje rezervácie" },
        { status: 400 }
      )
    }

    const now = new Date()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.$transaction(async (tx) => {
      // najprv zmaž expirované rezervácie pre toto miesto
      await tx.reservationSeat.deleteMany({
        where: {
          terminId,
          hallSeatId,
          expiresAt: {
            lt: now
          }
        }
      })

      const existingCount = await tx.reservationSeat.count({
        where: {
          sessionId,
          terminId,
          status: "RESERVED",
          expiresAt: {
            gt: now
          }
        }
      })

      const mine = await tx.reservationSeat.findFirst({
        where: {
          terminId,
          hallSeatId,
          sessionId,
          status: "RESERVED",
          expiresAt: {
            gt: now
          }
        }
      })

      if (mine) {
        return
      }

      if (existingCount >= MAX_TICKETS_PER_SESSION) {
        throw new Error(`Maximálny počet miest je ${MAX_TICKETS_PER_SESSION}`)
      }

      const existingReservation = await tx.reservationSeat.findFirst({
        where: {
          terminId,
          hallSeatId,
          status: "RESERVED",
          expiresAt: {
            gt: now
          }
        }
      })

      if (existingReservation) {
        throw new Error("Miesto je už rezervované")
      }

      const soldTicket = await tx.ticket.findFirst({
        where: {
          seatId: hallSeatId,
          order: {
            terminId
          }
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
    let message = "Rezervácia zlyhala"

    if (error instanceof Error) {
      message = error.message
    }

    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()

    const terminId = Number(body.terminId)
    const hallSeatId = Number(body.hallSeatId)
    const sessionId = String(body.sessionId || "").trim()

    if (!terminId || !hallSeatId || !sessionId) {
      return NextResponse.json(
        { error: "Chýbajú údaje rezervácie" },
        { status: 400 }
      )
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
    let message = "Zrušenie rezervácie zlyhalo"

    if (error instanceof Error) {
      message = error.message
    }

    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}