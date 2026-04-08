import { PDFDocument, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import fs from "fs"
import path from "path"
import QRCode from "qrcode"

type Seat = {
  typMiesta: string
  rad: number | null
  cislo: number | null
  stol: number | null
  stolicka: number | null
}

type OrderData = {
  orderCode: string
  name: string | null
  email: string | null
  totalAmount: number
  nazov: string
  datumCas: Date
  hall: string
  seats: Seat[]
}

function formatSeat(seat: Seat) {
  if (seat.typMiesta === "ROW_SEAT") {
    return `Rad ${seat.rad} – Miesto ${seat.cislo}`
  }

  if (seat.typMiesta === "TABLE_SEAT") {
    return `Stôl ${seat.stol} – Stolička ${seat.stolicka}`
  }

  return "Miesto"
}

export async function generateOrderPdf(data: OrderData) {
  const pdfDoc = await PDFDocument.create()

  // 🔥 KĽÚČOVÁ OPRAVA
  pdfDoc.registerFontkit(fontkit)

  const fontPath = path.join(process.cwd(), "fonts", "Roboto-Regular.ttf")
  const fontBytes = fs.readFileSync(fontPath)

  const font = await pdfDoc.embedFont(fontBytes)

  const page = pdfDoc.addPage([600, 320])
  const { height } = page.getSize()

  // HEADER
  page.drawText("Divadlo Poprad", {
    x: 200,
    y: height - 50,
    size: 24,
    font,
    color: rgb(0, 0, 0)
  })

  page.drawText(`Inscenácia: ${data.nazov}`, {
    x: 50,
    y: height - 100,
    size: 16,
    font
  })

  page.drawText(
    `Dátum: ${data.datumCas.toLocaleString("sk-SK")}`,
    {
      x: 50,
      y: height - 130,
      size: 16,
      font
    }
  )

  page.drawText(`Priestor: ${data.hall}`, {
    x: 50,
    y: height - 160,
    size: 16,
    font
  })

  // 👤 USER
  page.drawText(`Meno: ${data.name ?? "-"}`, {
    x: 50,
    y: height - 190,
    size: 14,
    font
  })

  page.drawText(`Email: ${data.email ?? "-"}`, {
    x: 50,
    y: height - 210,
    size: 14,
    font
  })

  // 🎟️ SEATS
  let y = height - 240

  data.seats.forEach((seat) => {
    page.drawText(formatSeat(seat), {
      x: 50,
      y,
      size: 14,
      font
    })
    y -= 20
  })

  // 💰 PRICE
  page.drawText(`Suma: ${data.totalAmount} €`, {
    x: 50,
    y: 40,
    size: 14,
    font
  })

  // 🔑 ORDER CODE
  page.drawText(`Kód objednávky: ${data.orderCode}`, {
    x: 50,
    y: 20,
    size: 12,
    font
  })

  // 🔳 QR
  const qrImage = await QRCode.toDataURL(data.orderCode)
  const qrBytes = await fetch(qrImage).then((res) => res.arrayBuffer())
  const qrEmbed = await pdfDoc.embedPng(qrBytes)

  page.drawImage(qrEmbed, {
    x: 420,
    y: height - 240,
    width: 120,
    height: 120
  })

  const pdfBytes = await pdfDoc.save()

  return Buffer.from(pdfBytes)
}