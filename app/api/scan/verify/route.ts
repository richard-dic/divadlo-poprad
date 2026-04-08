import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

  if (auth instanceof Response) return auth

  try {
    const { code, terminId } = await req.json()

    if (!code || !terminId) {
      return NextResponse.json({ status: "INVALID" }, { status: 400 })
    }

    if (String(code).startsWith("TKT")) {
      const ticket = await prisma.ticket.findUnique({
        where: { code: String(code) },
        include: {
          order: true,
          seat: true
        }
      })

      if (!ticket) {
        return NextResponse.json({ status: "INVALID" })
      }

      if (ticket.order.terminId !== Number(terminId)) {
        return NextResponse.json({
          type: "TICKET",
          status: "WRONG_EVENT"
        })
      }

      if (ticket.usedAt) {
        return NextResponse.json({
          type: "TICKET",
          status: "USED",
          ticketId: ticket.id,
          seat: ticket.seat
        })
      }

      return NextResponse.json({
        type: "TICKET",
        status: "VALID",
        ticketId: ticket.id,
        seat: ticket.seat
      })
    }

    if (String(code).startsWith("ORD")) {
      const order = await prisma.order.findUnique({
        where: { code: String(code) },
        include: {
          tickets: {
            include: {
              seat: true
            }
          }
        }
      })

      if (!order) {
        return NextResponse.json({ status: "INVALID" })
      }

      if (order.terminId !== Number(terminId)) {
        return NextResponse.json({
          type: "ORDER",
          status: "WRONG_EVENT"
        })
      }

      return NextResponse.json({
        type: "ORDER",
        status: order.status,
        orderId: order.id,
        totalAmount: order.totalAmount,
        email: order.email,
        count: order.tickets.length,
        seats: order.tickets.map((t) => t.seat)
      })
    }

    return NextResponse.json({ status: "INVALID" })
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      { status: "ERROR" },
      { status: 500 }
    )
  }
}