import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

  if (auth instanceof Response) return auth

  try {
    const { orderId, giftCode } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: "Chýba orderId" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Objednávka neexistuje" },
        { status: 404 }
      )
    }

    let discount = 0

    if (giftCode) {
      const card = await prisma.giftCard.findUnique({
        where: { code: String(giftCode) }
      })

      if (card && card.active) {
        discount = Math.min(card.remainingAmount, order.totalAmount)
      }
    }

    return NextResponse.json({
      originalAmount: order.totalAmount,
      discount,
      finalAmount: order.totalAmount - discount
    })
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}