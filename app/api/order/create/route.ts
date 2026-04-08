import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { generateOrderCode } from "@/lib/generateOrderCode"
import { generateTicketCode } from "@/lib/generateTicketCode"

export async function POST(req: Request) {

  await requireApiRole(["SELLER_EXTERNAL", "CONTROLLER", "ADMIN"])

  const body = await req.json()

  const {
    terminId,
    seatIds,
    email,
    name
  } = body

  if (!terminId || !seatIds?.length) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  const termin = await prisma.terminHrania.findUnique({
    where: { id: Number(terminId) }
  })

  if (!termin) {
    return NextResponse.json({ error: "Termin not found" }, { status: 404 })
  }

  const totalAmount = termin.zakladnaCena * seatIds.length

  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(), // 🔥 PRIDAŤ

      terminId: Number(terminId),
      email,
      name,

      status: "RESERVED_UNPAID",
      source: "EXTERNAL_SELLER",
      totalAmount,

      tickets: {
        create: seatIds.map((seatId: number) => ({
          code: generateTicketCode(),
          seatId
        }))
      }
    },
    include: {
      tickets: true
    }
  })

  return NextResponse.json({
    orderId: order.id,
    orderCode: order.code, // 🔥 BONUS
    totalAmount: order.totalAmount,
    tickets: order.tickets
  })
}