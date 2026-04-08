import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {

  const body = await request.json()

  const code = body.code
  const amount = Number(body.amount)

  const card = await prisma.giftCard.findUnique({
    where: { code }
  })

  if (!card || !card.active) {

    return NextResponse.json(
      { error: "Neplatná poukážka" },
      { status: 400 }
    )

  }

  if (card.remainingAmount < amount) {

    return NextResponse.json(
      { error: "Nedostatok kreditu" },
      { status: 400 }
    )

  }

  const updated = await prisma.giftCard.update({

    where: { id: card.id },

    data: {

      remainingAmount: card.remainingAmount - amount

    }

  })

  return NextResponse.json(updated)

}