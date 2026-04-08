import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { sendCancelEmail } from "@/lib/email/sendCancelEmail"
import { broadcastSeatUpdate } from "@/lib/seatEvents"
import Stripe from "stripe"
import { OrderStatus } from "@prisma/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      tickets: true,
      termin: {
        include: {
          inscenacia: true
        }
      }
    }
  })

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (order.status === OrderStatus.CANCELLED) {
    return NextResponse.json({ error: "Už zrušené" }, { status: 400 })
  }

  const seatIds = order.tickets.map((ticket) => ticket.seatId)

  let giftReturned = 0
  let stripeReturned = 0

  if (order.giftCardId) {
    const transactions = await prisma.giftCardTransaction.findMany({
      where: {
        orderId: order.id,
        type: "USE"
      }
    })

    const usedAmount = transactions.reduce((sum, t) => sum + t.amount, 0)

    if (usedAmount > 0) {
      await prisma.giftCard.update({
        where: { id: order.giftCardId },
        data: {
          remainingAmount: {
            increment: usedAmount
          }
        }
      })

      await prisma.giftCardTransaction.create({
        data: {
          giftCardId: order.giftCardId,
          amount: usedAmount,
          type: "REFUND",
          orderId: order.id,
          note: "Vrátenie po zrušení objednávky"
        }
      })

      giftReturned = usedAmount
    }
  }

  if (order.stripePaymentIntentId) {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId
    })

    if (typeof refund.amount === "number") {
      stripeReturned = refund.amount / 100
    }
  }

  await prisma.ticket.deleteMany({
    where: {
      orderId: order.id
    }
  })

  // 🔥 kľúčová oprava – odstrániť reservation lock
  await prisma.reservationSeat.deleteMany({
    where: {
      terminId: order.terminId,
      hallSeatId: {
        in: seatIds
      }
    }
  })

  await prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.CANCELLED
    }
  })

  broadcastSeatUpdate({ type: "ORDER_CANCELLED" })

  if (order.email) {
    try {
      await sendCancelEmail({
        email: order.email,
        orderCode: order.code,
        predstavenie: order.termin.inscenacia.nazov,
        datum: order.termin.datumCas,
        stripeReturned,
        giftReturned
      })
    } catch (e) {
      console.error("EMAIL ERROR:", e)
    }
  }

  return NextResponse.json({
    success: true,
    stripeReturned,
    giftReturned
  })
}