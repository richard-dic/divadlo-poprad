import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {

  const body = await request.json()
  const { code } = body

  if (!code) {
    return NextResponse.json(
      { error: "Kód poukážky je povinný" },
      { status: 400 }
    )
  }

  const card = await prisma.giftCard.findUnique({
    where: { code },
    include: {
      transactions: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  })

  if (!card) {
    return NextResponse.json(
      { error: "Poukážka neexistuje" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    code: card.code,
    initialAmount: card.initialAmount,
    remainingAmount: card.remainingAmount,
    active: card.active,
    expiresAt: card.expiresAt,
    transactions: card.transactions
  })

}