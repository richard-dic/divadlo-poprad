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

type OrderWithTickets = Order & {
  tickets: (Ticket & {
    seat: HallSeat
  })[]
  termin: TerminHrania & {
    inscenacia: DivadelnaInscenacia
    hall: Hall
  }
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

export async function generateOrderReservationPdf(order: OrderWithTickets) {
  const pdfDoc = await PDFDocument.create()

  pdfDoc.registerFontkit(fontkit)

  const fontPath = path.join(process.cwd(), "fonts", "Roboto-Regular.ttf")
  const fontBytes = fs.readFileSync(fontPath)
  const font = await pdfDoc.embedFont(fontBytes)

  const page = pdfDoc.addPage([600, 420])
  const { height } = page.getSize()

  const qrImage = await QRCode.toDataURL(order.code)
  const qrImageBytes = await fetch(qrImage).then((res) => res.arrayBuffer())
  const qrEmbed = await pdfDoc.embedPng(qrImageBytes)

  page.drawText("Divadlo Poprad", {
    x: 50,
    y: height - 50,
    size: 24,
    font,
    color: rgb(0, 0, 0)
  })

  page.drawText("Rezervácia – úhrada na mieste", {
    x: 50,
    y: height - 80,
    size: 16,
    font
  })

  page.drawText(`Inscenácia: ${order.termin.inscenacia.nazov}`, {
    x: 50,
    y: height - 120,
    size: 14,
    font
  })

  page.drawText(
    `Dátum: ${order.termin.datumCas.toLocaleString("sk-SK")}`,
    {
      x: 50,
      y: height - 145,
      size: 14,
      font
    }
  )

  page.drawText(`Priestor: ${order.termin.hall.nazov}`, {
    x: 50,
    y: height - 170,
    size: 14,
    font
  })

  page.drawText(`Objednávkový kód: ${order.code}`, {
    x: 50,
    y: height - 195,
    size: 14,
    font
  })

  page.drawText(`Meno: ${order.name ?? "-"}`, {
    x: 50,
    y: height - 220,
    size: 14,
    font
  })

  page.drawText(`Email: ${order.email ?? "-"}`, {
    x: 50,
    y: height - 245,
    size: 14,
    font
  })

  page.drawText(`Suma na úhradu: ${order.totalAmount.toFixed(2)} €`, {
    x: 50,
    y: height - 270,
    size: 14,
    font
  })

  page.drawText("Miesta:", {
    x: 50,
    y: height - 300,
    size: 14,
    font
  })

  let y = height - 325

  for (const ticket of order.tickets) {
    page.drawText(`• ${formatSeat(ticket.seat)}`, {
      x: 70,
      y,
      size: 12,
      font
    })
    y -= 18
  }

  page.drawText("Pri vstupe predložte tento QR kód a uhraďte rezerváciu.", {
    x: 50,
    y: 45,
    size: 12,
    font
  })

  page.drawImage(qrEmbed, {
    x: 420,
    y: height - 230,
    width: 130,
    height: 130
  })

  const pdfBytes = await pdfDoc.save()

  const ordersDir = path.join(process.cwd(), "public", "orders")

  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true })
  }

  const fileName = `order-${order.id}.pdf`
  const filePath = path.join(ordersDir, fileName)

  fs.writeFileSync(filePath, pdfBytes)

  return fileName
}