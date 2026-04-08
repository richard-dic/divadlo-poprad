import { prisma } from "@/lib/prisma"
import { generateTicketCode } from "@/lib/generateTicketCode"
import { generateTicket } from "@/lib/generateTicket"

export async function finalizePaidOrder(orderId: number) {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!existingOrder) {
    throw new Error("Objednávka neexistuje")
  }

  if (existingOrder.status === "PAID") {
    return
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID"
    }
  })

  if (order.giftCardId && order.giftCardAppliedAmount > 0) {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: order.giftCardId }
    })

    if (!giftCard) {
      throw new Error("Darčeková poukážka neexistuje")
    }

    if (giftCard.remainingAmount < order.giftCardAppliedAmount) {
      throw new Error("Nedostatok kreditu na poukážke")
    }

    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: {
        remainingAmount: giftCard.remainingAmount - order.giftCardAppliedAmount
      }
    })

    await prisma.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        amount: order.giftCardAppliedAmount,
        type: "REDEEM",
        orderId: order.id,
        note: "Uplatnenie poukážky pri objednávke"
      }
    })
  }

  const reservations = await prisma.reservationSeat.findMany({
    where: {
      terminId: order.terminId,
      sessionId: order.sessionId ?? undefined,
      status: "RESERVED",
      expiresAt: {
        gt: new Date()
      }
    }
  })

  for (const r of reservations) {

    const exists = await prisma.ticket.findFirst({

        where: {
        terminId: r.terminId,
        hallSeatId: r.hallSeatId
        }

    })

    if (exists) continue

    await prisma.ticket.create({

        data: {
        ticketCode: generateTicketCode(),
        orderId: order.id,
        terminId: r.terminId,
        hallSeatId: r.hallSeatId
        }

    })

    }

  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      tickets: {
        include: {
          hallSeat: true,
          termin: {
            include: {
              inscenacia: true,
              hall: true
            }
          }
        }
      }
    }
  })

  if (fullOrder) {
    await generateTicket(fullOrder)
  }
}