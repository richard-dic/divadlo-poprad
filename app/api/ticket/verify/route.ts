import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { verifySignedTicket } from "@/lib/signTicket"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(request: Request) {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

  if (auth instanceof Response) {
    return auth
  }

  try {
    const body = await request.json()

    const rawCode = String(body.ticketCode || "").trim()
    const terminId = Number(body.terminId)

    if (!rawCode || !terminId) {
      return NextResponse.json(
        { status: "INVALID" },
        { status: 400 }
      )
    }

    // 🔥 ORDER QR
    if (rawCode.startsWith("ORD-")) {
      const order = await prisma.order.findUnique({
        where: { code: rawCode },
        include: {
          tickets: true
        }
      })

      if (!order) {
        return NextResponse.json({ status: "INVALID" })
      }

      if (order.terminId !== terminId) {
        return NextResponse.json({ status: "WRONG_EVENT" })
      }

      return NextResponse.json({
        status: "ORDER",
        paid: order.status === "PAID",
        totalAmount: order.totalAmount,
        orderId: order.id,
        count: order.tickets.length
      })
    }

    // 🔥 TICKET QR
    let ticketCode: string | null = null

    if (rawCode.includes(".")) {
      ticketCode = verifySignedTicket(rawCode)
    } else {
      ticketCode = rawCode
    }

    if (!ticketCode) {
      return NextResponse.json({ status: "INVALID" })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { code: ticketCode },
      include: {
        order: true
      }
    })

    if (!ticket) {
      return NextResponse.json({ status: "INVALID" })
    }

    if (ticket.order.terminId !== terminId) {
      return NextResponse.json({ status: "WRONG_EVENT" })
    }

    if (ticket.usedAt) {
      return NextResponse.json({ status: "USED" })
    }

    return NextResponse.json({
      status: "VALID",
      ticketId: ticket.id
    })
  } catch (error) {
    console.error("Ticket verify error:", error)

    return NextResponse.json(
      { status: "INVALID" },
      { status: 500 }
    )
  }
}