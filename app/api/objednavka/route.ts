import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { OrderSource, OrderStatus, Prisma } from "@prisma/client"
import { generateTicketCode } from "@/lib/generateTicketCode"
import { generateTicket } from "@/lib/generateTicket"
import { sendTicketEmail } from "@/lib/email/sendTicketEmail"
import { generateOrderCode } from "@/lib/generateOrderCode"
import { broadcastSeatUpdate } from "@/lib/seatEvents"

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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { terminId, sessionId, meno, email, telefon, giftCode } = body

    if (!terminId || !sessionId || !meno || !email || !telefon) {
      return NextResponse.json(
        { error: "Chýbajú údaje objednávky" },
        { status: 400 }
      )
    }

    const termin = await prisma.terminHrania.findUnique({
      where: { id: Number(terminId) }
    })

    if (!termin) {
      return NextResponse.json(
        { error: "Termín neexistuje" },
        { status: 404 }
      )
    }

    const reservations = await prisma.reservationSeat.findMany({
      where: {
        terminId: Number(terminId),
        sessionId,
        status: "RESERVED",
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (reservations.length === 0) {
      return NextResponse.json(
        { error: "Žiadne aktívne rezervácie" },
        { status: 400 }
      )
    }

    const totalPrice = reservations.length * termin.zakladnaCena
    const seatIds = reservations.map((reservation) => reservation.hallSeatId)

    let giftCardId: number | null = null
    let giftAmount = 0

    if (giftCode) {
      const card = await prisma.giftCard.findUnique({
        where: { code: giftCode }
      })

      if (!card || !card.active) {
        return NextResponse.json(
          { error: "Neplatná darčeková poukážka" },
          { status: 400 }
        )
      }

      giftCardId = card.id
      giftAmount = Math.min(card.remainingAmount, totalPrice)
    }

    const payableAmount = totalPrice - giftAmount

    const order = await prisma.order.create({
      data: {
        code: generateOrderCode(),
        terminId: Number(terminId),
        email,
        name: meno,
        status:
          payableAmount === 0
            ? OrderStatus.PAID
            : OrderStatus.RESERVED_UNPAID,
        source: OrderSource.WEB,
        totalAmount: payableAmount,
        paidAt: payableAmount === 0 ? new Date() : null,
        giftCardId,
        tickets: {
          create: reservations.map((reservation) => ({
            code: generateTicketCode(),
            seatId: reservation.hallSeatId
          }))
        }
      },
      include: {
        tickets: {
          include: {
            seat: true
          }
        },
        termin: {
          include: {
            inscenacia: true,
            hall: true
          }
        }
      }
    })

    if (giftCardId && giftAmount > 0) {
      await prisma.giftCard.update({
        where: { id: giftCardId },
        data: {
          remainingAmount: {
            decrement: giftAmount
          }
        }
      })

      await prisma.giftCardTransaction.create({
        data: {
          giftCardId,
          amount: giftAmount,
          type: "USE",
          orderId: order.id,
          note: "Použitie na nákup vstupeniek"
        }
      })
    }

    // 🔥 kľúčová oprava – po vytvorení objednávky zrušiť dočasné rezervácie
    await prisma.reservationSeat.deleteMany({
      where: {
        terminId: Number(terminId),
        hallSeatId: {
          in: seatIds
        }
      }
    })

    if (payableAmount === 0) {
      try {
        const fullOrder: FullOrder | null = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            tickets: {
              include: {
                seat: true
              }
            },
            termin: {
              include: {
                inscenacia: true,
                hall: true
              }
            }
          }
        })

        if (fullOrder) {
          const pdfFile = await generateTicket(fullOrder)

          if (order.email && pdfFile) {
            await sendTicketEmail(order.email, order.id, pdfFile)
          }
        }
      } catch (emailError) {
        console.error("GIFTCARD EMAIL/PDF ERROR:", emailError)
      }
    }

    broadcastSeatUpdate({ type: "ORDER_UPDATED" })

    return NextResponse.json(order)
  } catch (err) {
    console.error("OBJEDNAVKA ERROR:", err)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}