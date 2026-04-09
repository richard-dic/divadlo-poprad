
import { Prisma } from "@prisma/client"
import { generateOrderPdf } from "@/lib/generateOrderPdf"

import { sendEmail } from "@/lib/mailer"



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

export async function sendOrderEmail(
  email: string,
  order: FullOrder
) {
  try {
    const pdf = await generateOrderPdf({
      orderCode: order.code,
      name: order.name,
      email: order.email,
      totalAmount: order.totalAmount,
      nazov: order.termin.inscenacia.nazov,
      datumCas: order.termin.datumCas,
      hall: order.termin.hall.nazov,
      seats: order.tickets.map((ticket) => ticket.seat)
    })

    const result = await sendEmail({
      to: email,
      subject: "Rezervácia vstupeniek",
      html: `
        <h2>Vaša rezervácia</h2>
        <p>Kód objednávky: <b>${order.code}</b></p>
        <p>Suma na úhradu: <b>${order.totalAmount.toFixed(2)} €</b></p>
        <p>PDF s QR kódom nájdete v prílohe.</p>
      `,
      attachments: [
        {
          filename: "rezervacia.pdf",
          content: pdf
        }
      ]
    })

    console.log("EMAIL SENT:", result)
  } catch (err) {
    console.error("EMAIL ERROR:", err)
  }
}