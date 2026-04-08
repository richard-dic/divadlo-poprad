import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { getCurrentUser } from "@/lib/auth"
import { OrderSource, OrderStatus, Prisma } from "@prisma/client"
import { generateTicketCode } from "@/lib/generateTicketCode"
import { generateOrderCode } from "@/lib/generateOrderCode"
import { broadcastSeatUpdate } from "@/lib/seatEvents"
import { generateTicket } from "@/lib/generateTicket"
import { sendTicketEmail } from "@/lib/email/sendTicketEmail"
import { sendOrderEmail } from "@/lib/email/sendOrderEmail"

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
  const auth = await requireApiRole([
    "ADMIN",
    "CONTROLLER",
    "SELLER_INTERNAL",
    "SELLER_EXTERNAL"
  ])

  if (auth instanceof Response) return auth

  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const terminId = Number(body.terminId)
    const sessionId = String(body.sessionId || "").trim()

    const seatIds: number[] = Array.isArray(body.seatIds)
      ? body.seatIds
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isInteger(id) && id > 0)
      : []

    const email: string | null = body.email
      ? String(body.email).trim()
      : null

    const sendEmail: boolean = Boolean(body.sendEmail)

    const giftCode: string | null = body.giftCode
      ? String(body.giftCode).trim()
      : null

    if (!terminId || seatIds.length === 0) {
      return NextResponse.json(
        { error: "Chýbajú údaje" },
        { status: 400 }
      )
    }

    const termin = await prisma.terminHrania.findUnique({
      where: { id: terminId }
    })

    if (!termin) {
      return NextResponse.json(
        { error: "Termín neexistuje" },
        { status: 404 }
      )
    }

    const uniqueSeatIds = Array.from(new Set<number>(seatIds))
    const isExternal = user.role === "SELLER_EXTERNAL"

    // 🔥 external MUSÍ mať email
    if (isExternal && !email) {
      return NextResponse.json(
        { error: "Pri externom predaji je povinný email." },
        { status: 400 }
      )
    }

    // 🔥 kontrola predaných miest
    const soldTickets = await prisma.ticket.findMany({
      where: {
        seatId: { in: uniqueSeatIds },
        order: { terminId }
      },
      select: { seatId: true }
    })

    if (soldTickets.length > 0) {
      return NextResponse.json(
        { error: "Niektoré miesta sú už predané" },
        { status: 400 }
      )
    }

    // 🔥 kontrola rezervácií
    const activeReservations = await prisma.reservationSeat.findMany({
      where: {
        terminId,
        hallSeatId: { in: uniqueSeatIds },
        status: "RESERVED",
        expiresAt: { gt: new Date() }
      }
    })

    const foreignReservations = activeReservations.filter(
      (r) => r.sessionId !== sessionId
    )

    if (foreignReservations.length > 0) {
      return NextResponse.json(
        { error: "Niektoré miesta sú rezervované" },
        { status: 400 }
      )
    }

    const source = isExternal
      ? OrderSource.EXTERNAL_SELLER
      : OrderSource.CONTROLLER

    let total = uniqueSeatIds.length * termin.zakladnaCena

    let giftCardId: number | null = null
    let discount = 0

    // 🎁 gift card iba pre internal
    if (!isExternal && giftCode) {
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
      discount = Math.min(card.remainingAmount, total)
      total -= discount
    }

    const status = isExternal
      ? OrderStatus.RESERVED_UNPAID
      : OrderStatus.PAID

    // 🔥 CREATE ORDER
    const order = await prisma.order.create({
      data: {
        code: generateOrderCode(),
        terminId,
        email,
        status,
        source,
        totalAmount: total,
        paidAt: isExternal ? null : new Date(),
        giftCardId,
        tickets: {
          create: uniqueSeatIds.map((seatId) => ({
            code: generateTicketCode(),
            seatId
          }))
        }
      }
    })

    // 🎁 gift card update
    if (giftCardId && discount > 0) {
      await prisma.giftCard.update({
        where: { id: giftCardId },
        data: {
          remainingAmount: {
            decrement: discount
          }
        }
      })

      await prisma.giftCardTransaction.create({
        data: {
          giftCardId,
          amount: discount,
          type: "USE",
          orderId: order.id,
          note: "Použitie pri predaji"
        }
      })
    }

    // 🔥 uvoľni reservation lock
    await prisma.reservationSeat.deleteMany({
      where: {
        terminId,
        hallSeatId: {
          in: uniqueSeatIds
        }
      }
    })

    // 🔥 načítaj full order (pre emaily)
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

    // 🎟️ INTERNAL → ticket PDF
    if (!isExternal && sendEmail && email && status === OrderStatus.PAID && fullOrder) {
      try {
        const pdf = await generateTicket(fullOrder)

        if (pdf) {
          await sendTicketEmail(email, order.id, pdf)
        }
      } catch (e) {
        console.error("EMAIL ERROR:", e)
      }
    }

    // 📄 EXTERNAL → order PDF
    if (isExternal && email && fullOrder) {
      try {
        await sendOrderEmail(email, fullOrder)
      } catch (e) {
        console.error("ORDER EMAIL ERROR:", e)
      }
    }

    broadcastSeatUpdate({ type: "ORDER_UPDATED" })

    return NextResponse.json({
      success: true,
      orderCode: order.code,
      status: order.status,
      finalAmount: total,
      discount
    })
  } catch (err) {
    console.error("SELLER ERROR:", err)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}