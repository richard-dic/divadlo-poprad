import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {

  const body = await request.json()

  const { terminId, sessionId, giftCode } = body

  if (!terminId || !sessionId) {

    return NextResponse.json(
      { error: "Chýbajú údaje" },
      { status: 400 }
    )

  }

  // načítaj termin aby sme vedeli cenu
  const termin = await prisma.terminHrania.findUnique({
    where: { id: terminId }
  })

  if (!termin) {

    return NextResponse.json(
      { error: "Termín neexistuje" },
      { status: 404 }
    )

  }

  const seatPrice = termin.zakladnaCena

  const reservations = await prisma.reservationSeat.findMany({
    where: {
      terminId,
      sessionId
    }
  })

  const seats = reservations.length

  const totalPrice = seats * seatPrice

  let giftAmount = 0

  if (giftCode) {

    const card = await prisma.giftCard.findUnique({
      where: { code: giftCode }
    })

    if (card && card.active) {

      giftAmount = Math.min(card.remainingAmount, totalPrice)

    }

  }

  const payable = totalPrice - giftAmount

  return NextResponse.json({

    seats,
    seatPrice,
    totalPrice,
    giftAmount,
    payable

  })

}