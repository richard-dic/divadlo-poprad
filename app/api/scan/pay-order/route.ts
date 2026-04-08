import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sendTicketEmail } from "@/lib/email/sendTicketEmail"
import { generateTicket } from "@/lib/generateTicket"

export async function POST(req: Request) {
  const { orderId, email } = await req.json()

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paidAt: new Date()
    },
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

  // 🎟️ po zaplatení pošli klasický ticket
  if (email) {
    const pdf = await generateTicket(order)
    if (pdf) {
      await sendTicketEmail(email, order.id, pdf)
    }
  }

  return NextResponse.json({ success: true })
}