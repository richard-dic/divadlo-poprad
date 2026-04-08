import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { broadcastSeatUpdate } from "@/lib/seatEvents"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

  if (auth instanceof Response) return auth

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "Objednávka nie je zaplatená" },
        { status: 400 }
      )
    }

    await prisma.ticket.updateMany({
      where: {
        orderId: Number(orderId),
        usedAt: null
      },
      data: {
        usedAt: new Date()
      }
    })

    await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status: "USED"
      }
    })

    broadcastSeatUpdate({
        type: "ORDER_UPDATED"
    })

    return NextResponse.json({
      status: "CHECKED_IN"
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}