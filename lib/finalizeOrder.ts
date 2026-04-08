import { prisma } from "@/lib/prisma"
import { generateTicket } from "@/lib/generateTicket"
import { sendTicketEmail } from "@/lib/email/sendTicketEmail"
import { OrderStatus } from "@prisma/client"

export async function finalizeOrder(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
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

  if (!order) {
    throw new Error("Order neexistuje")
  }

  if (order.status !== OrderStatus.PAID) {
    throw new Error("Order ešte nie je zaplatený")
  }

  if (order.tickets.length === 0) {
    throw new Error("Order nemá žiadne tickety")
  }

  const pdfFile = await generateTicket(order)

  if (order.email && pdfFile) {
    await sendTicketEmail(
      order.email,
      order.id,
      pdfFile
    )
  }
}