import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET() {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) return auth

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const ordersToday = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      },
      status: "PAID"
    }
  })

  const revenueToday = ordersToday.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  )

  const totalSeats = await prisma.hallSeat.count()

  const soldSeats = await prisma.ticket.count()

  const occupancy =
    totalSeats === 0 ? 0 : Math.round((soldSeats / totalSeats) * 100)

  return NextResponse.json({
    revenueToday,
    totalSeats,
    soldSeats,
    occupancy
  })
}