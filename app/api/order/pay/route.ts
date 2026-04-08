import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { broadcastSeatUpdate } from "@/lib/seatEvents"
import { sendTicketEmail } from "@/lib/email/sendTicketEmail"
import { generateTicket } from "@/lib/generateTicket"
import { Prisma } from "@prisma/client"

type FullOrder = Prisma.OrderGetPayload<{
  include: {
    tickets: {
      include: {
        seat: true
      }
    }
    termin: {
      include: {
        inscenacia: true
        hall: true
      }
    }
  }
}>

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

  if (auth instanceof Response) return auth

  try {
    const { orderId, giftCode, email } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        tickets: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === "PAID") {
      return NextResponse.json({ status: "ALREADY_PAID" })
    }

    if (order.status === "USED") {
      return NextResponse.json({ status: "ALREADY_USED" })
    }

    let discount = 0

    if (giftCode) {
      const card = await prisma.giftCard.findUnique({
        where: { code: giftCode }
      })

      if (!card || !card.active) {
        return NextResponse.json(
          { error: "Neplatná poukážka" },
          { status: 400 }
        )
      }

      discount = Math.min(card.remainingAmount, order.totalAmount)

      await prisma.giftCard.update({
        where: { id: card.id },
        data: {
          remainingAmount: {
            decrement: discount
          }
        }
      })

      await prisma.giftCardTransaction.create({
        data: {
          giftCardId: card.id,
          amount: discount,
          type: "USE",
          orderId: order.id,
          note: "Použitie pri vstupe"
        }
      })
    }

    const finalAmount = order.totalAmount - discount

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        totalAmount: finalAmount,
        email: email ? String(email).trim() : order.email
      }
    })

    // 🔥 automaticky označ všetky tickety ako použité (vstup povolený hneď)
    await prisma.ticket.updateMany({
      where: {
        orderId: order.id
      },
      data: {
        usedAt: new Date()
      }
    })

    const fullOrder: FullOrder | null = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        tickets: {
          include: { seat: true }
        },
        termin: {
          include: {
            inscenacia: true,
            hall: true
          }
        }
      }
    })

    if (email && fullOrder) {
      try {
        const pdf = await generateTicket(fullOrder)

        if (pdf) {
          await sendTicketEmail(String(email).trim(), order.id, pdf)
        }
      } catch (e) {
        console.error("PAY ORDER EMAIL ERROR:", e)
      }
    }

    broadcastSeatUpdate({
      type: "ORDER_UPDATED"
    })

    return NextResponse.json({
      status: "PAID",
      discount,
      finalAmount
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}