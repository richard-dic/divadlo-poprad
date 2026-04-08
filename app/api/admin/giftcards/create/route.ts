import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { generateGiftCardCode } from "@/lib/generateGiftCardCode"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(request: Request) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const body = await request.json()
  const amount = Number(body.amount)

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: "Neplatná suma" },
      { status: 400 }
    )
  }

  const code = generateGiftCardCode()

  const card = await prisma.giftCard.create({
    data: {
      code,
      initialAmount: amount,
      remainingAmount: amount,
      active: true
    }
  })

  await prisma.giftCardTransaction.create({
    data: {
      giftCardId: card.id,
      amount,
      type: "ISSUE",
      note: "Ručne vytvorená poukážka"
    }
  })

  return NextResponse.json(card)
}