import { PDFDocument, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import fs from "fs"
import path from "path"
import QRCode from "qrcode"
import {
  Order,
  Ticket,
  HallSeat,
  TerminHrania,
  DivadelnaInscenacia,
  Hall
} from "@prisma/client"
import { uploadGeneratedFile } from "@/lib/storage"

type OrderWithTickets = Order & {
  tickets: (Ticket & {
    seat: HallSeat
  })[]
  termin: TerminHrania & {
    inscenacia: DivadelnaInscenacia
    hall: Hall
  }
}

export async function generateTicket(order: OrderWithTickets) {
  const pdfDoc = await PDFDocument.create()

  pdfDoc.registerFontkit(fontkit)

  const fontPath = path.join(process.cwd(), "fonts", "Roboto-Regular.ttf")
  const fontBytes = fs.readFileSync(fontPath)

  const font = await pdfDoc.embedFont(fontBytes)

  for (const t of order.tickets) {
    const page = pdfDoc.addPage([600, 320])
    const { height } = page.getSize()

    const qrData = t.code
    const qrImage = await QRCode.toDataURL(qrData)

    page.drawText("Divadlo Poprad", {
      x: 200,
      y: height - 50,
      size: 24,
      font,
      color: rgb(0, 0, 0)
    })

    page.drawText(`Inscenácia: ${order.termin.inscenacia.nazov}`, {
      x: 50,
      y: height - 110,
      size: 16,
      font
    })

    page.drawText(
      `Dátum: ${order.termin.datumCas.toLocaleString("sk-SK")}`,
      {
        x: 50,
        y: height - 140,
        size: 16,
        font
      }
    )

    page.drawText(`Priestor: ${order.termin.hall.nazov}`, {
      x: 50,
      y: height - 170,
      size: 16,
      font
    })

    page.drawText(formatSeat(t.seat), {
      x: 50,
      y: height - 200,
      size: 16,
      font
    })

    page.drawText(`Objednávka: ${order.id}`, {
      x: 50,
      y: height - 230,
      size: 12,
      font
    })

    page.drawText(`Kód vstupenky: ${t.code}`, {
      x: 50,
      y: height - 250,
      size: 12,
      font
    })

    const qrImageBytes = await fetch(qrImage).then((res) => res.arrayBuffer())
    const qrEmbed = await pdfDoc.embedPng(qrImageBytes)

    page.drawImage(qrEmbed, {
      x: 420,
      y: height - 240,
      width: 120,
      height: 120
    })
  }

  const pdfBytes = await pdfDoc.save()
  const fileName = `ticket-order-${order.id}.pdf`

  await uploadGeneratedFile(
    "tickets",
    fileName,
    Buffer.from(pdfBytes),
    "application/pdf"
  )

  return fileName
}

function formatSeat(seat: {
  typMiesta: string
  rad: number | null
  cislo: number | null
  stol: number | null
  stolicka: number | null
}) {
  if (seat.typMiesta === "ROW_SEAT") {
    return `Rad ${seat.rad} – Miesto ${seat.cislo}`
  }

  if (seat.typMiesta === "TABLE_SEAT") {
    return `Stôl ${seat.stol} – Stolička ${seat.stolicka}`
  }

  if (seat.typMiesta === "CHAIR") {
    return `Miesto ${seat.cislo ?? seat.stolicka ?? seat.rad ?? ""}`.trim()
  }

  if (seat.typMiesta === "CHILD_SEAT") {
    return `Detské miesto ${seat.cislo ?? ""}`.trim()
  }

  return "Miesto"
}