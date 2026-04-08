import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole([
    "ADMIN",
    "CONTROLLER",
    "SELLER_INTERNAL"
  ])

  if (auth instanceof Response) return auth

  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ valid: false })
    }

    const card = await prisma.giftCard.findUnique({
      where: { code }
    })

    if (!card || !card.active) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({
      valid: true,
      remainingAmount: card.remainingAmount
    })
  } catch (e) {
    return NextResponse.json({ valid: false })
  }
}