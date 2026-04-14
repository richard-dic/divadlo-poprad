import { PDFDocument, PDFPage, rgb } from "pdf-lib"
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

const PAGE_WIDTH = 600
const PAGE_HEIGHT = 320
const ACCENT = rgb(0 / 255, 94 / 255, 97 / 255)
const TEXT = rgb(0, 0, 0)
const MUTED = rgb(65 / 255, 65 / 255, 65 / 255)

export async function generateTicket(order: OrderWithTickets) {
  const pdfDoc = await PDFDocument.create()

  pdfDoc.registerFontkit(fontkit)

  const fontPath = path.join(process.cwd(), "fonts", "Roboto-Regular.ttf")
  const fontBytes = fs.readFileSync(fontPath)
  const font = await pdfDoc.embedFont(fontBytes)

  const backgroundPath = path.join(process.cwd(), "public", "backgrounds", "whiteBG.jpg")
  const tatryPath = path.join(process.cwd(), "public", "ui", "tatry.png")
  const logoPath = path.join(process.cwd(), "public", "ui", "logo.png")

  const backgroundBytes = fs.readFileSync(backgroundPath)
  const tatryBytes = fs.readFileSync(tatryPath)
  const logoBytes = fs.readFileSync(logoPath)

  const backgroundImage = await pdfDoc.embedJpg(backgroundBytes)
  const tatryImage = await pdfDoc.embedPng(tatryBytes)
  const logoImage = await pdfDoc.embedPng(logoBytes)

  for (const t of order.tickets) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

    page.drawImage(backgroundImage, {
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      opacity: 1
    })

    const watermarkMaxWidth = 360
    const watermarkScale = watermarkMaxWidth / logoImage.width
    const watermarkDims = logoImage.scale(watermarkScale)
    const watermarkX = (PAGE_WIDTH - watermarkDims.width) / 2
    const watermarkY = (PAGE_HEIGHT - watermarkDims.height) / 2 + 6

    page.drawImage(logoImage, {
      x: watermarkX,
      y: watermarkY,
      width: watermarkDims.width,
      height: watermarkDims.height,
      opacity: 0.14
    })

    page.drawText("VSTUPENKA", {
      x: 42,
      y: PAGE_HEIGHT - 42,
      size: 11,
      font,
      color: ACCENT
    })

    drawBoldText(page, order.termin.inscenacia.nazov, {
      x: 42,
      y: PAGE_HEIGHT - 86,
      size: 24,
      font,
      color: TEXT,
      maxWidth: 340
    })

    drawLabelValue(page, font, "Dátum", formatEventDate(order.termin.datumCas), 42, PAGE_HEIGHT - 126)
    drawLabelValue(page, font, "Priestor", order.termin.hall.nazov, 42, PAGE_HEIGHT - 152)
    drawLabelValue(page, font, "Miesto", formatSeat(t.seat), 42, PAGE_HEIGHT - 178)

    const qrImage = await QRCode.toDataURL(t.code, {
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
        dark: "#005E61",
        light: "#00000000"
      }
    })

    const qrImageBytes = Buffer.from(
      qrImage.replace(/^data:image\/png;base64,/, ""),
      "base64"
    )
    const qrEmbed = await pdfDoc.embedPng(qrImageBytes)

    page.drawImage(qrEmbed, {
      x: 408,
      y: 112,
      width: 132,
      height: 132
    })

    const codeSize = 10
    const codeWidth = font.widthOfTextAtSize(t.code, codeSize)
    const qrCenterX = 408 + 132 / 2
    const codeX = qrCenterX - codeWidth / 2

    page.drawText(t.code, {
      x: codeX,
      y: 94,
      size: codeSize,
      font,
      color: MUTED
    })

    page.drawImage(tatryImage, {
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: 54,
      opacity: 0.98
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

function drawLabelValue(
  page: PDFPageLike,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  label: string,
  value: string,
  x: number,
  y: number,
  valueSize = 13
) {
  page.drawText(`${label}:`, {
    x,
    y,
    size: 11,
    font,
    color: ACCENT
  })

  page.drawText(value, {
    x: x + 78,
    y,
    size: valueSize,
    font,
    color: TEXT,
    maxWidth: 260
  })
}

function drawBoldText(
  page: PDFPageLike,
  text: string,
  options: {
    x: number
    y: number
    size: number
    font: Awaited<ReturnType<PDFDocument["embedFont"]>>
    color: ReturnType<typeof rgb>
    maxWidth?: number
  }
) {
  page.drawText(text, options)
  page.drawText(text, {
    ...options,
    x: options.x + 0.35,
    y: options.y
  })
  page.drawText(text, {
    ...options,
    x: options.x,
    y: options.y - 0.2
  })
}

function formatEventDate(date: Date) {
  const d = String(date.getDate()).padStart(2, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const y = date.getFullYear()
  const h = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")

  return `${d}.${m}.${y} | ${h}:${min}`
}

type PDFPageLike = Pick<PDFPage, "drawText" | "drawImage">

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