import { PDFDocument, PDFPage, rgb } from "pdf-lib"
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

const PAGE_WIDTH = 600
const PAGE_HEIGHT = 350
const ACCENT = rgb(0 / 255, 94 / 255, 97 / 255)
const TEXT = rgb(0, 0, 0)
const MUTED = rgb(65 / 255, 65 / 255, 65 / 255)

function formatSeat(seat: Seat) {
  if (seat.typMiesta === "ROW_SEAT") {
    return `Rad ${seat.rad} – Miesto ${seat.cislo}`
  }

  if (seat.typMiesta === "TABLE_SEAT") {
    return `Stôl ${seat.stol} – Stolička ${seat.stolicka}`
  }

  return "Miesto"
}

function formatEventDate(date: Date) {
  const d = String(date.getDate()).padStart(2, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const y = date.getFullYear()
  const h = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")

  return `${d}.${m}.${y} | ${h}:${min}`
}

function drawLabelValue(
  page: PDFPageLike,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  label: string,
  value: string,
  x: number,
  y: number,
  valueSize = 13,
  valueMaxWidth = 260
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
    maxWidth: valueMaxWidth
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

type PDFPageLike = Pick<PDFPage, "drawText" | "drawImage">

export async function generateOrderPdf(data: OrderData) {
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

  page.drawText("REZERVÁCIA", {
    x: 42,
    y: PAGE_HEIGHT - 42,
    size: 11,
    font,
    color: ACCENT
  })

  drawBoldText(page, data.nazov, {
    x: 42,
    y: PAGE_HEIGHT - 86,
    size: 24,
    font,
    color: TEXT,
    maxWidth: 340
  })

  drawLabelValue(page, font, "Dátum", formatEventDate(data.datumCas), 42, PAGE_HEIGHT - 126)
  drawLabelValue(page, font, "Priestor", data.hall, 42, PAGE_HEIGHT - 152)
  drawLabelValue(page, font, "Email", data.email ?? "-", 42, PAGE_HEIGHT - 178, 12, 250)

  const seatsText = data.seats.map(formatSeat).join(", ") || "-"
  drawLabelValue(page, font, "Miesta", seatsText, 42, PAGE_HEIGHT - 204, 12, 250)

  drawBoldText(page, `SUMA NA ZAPLATENIE: ${data.totalAmount.toFixed(2)} €`, {
    x: 42,
    y: 40,
    size: 13,
    font,
    color: TEXT,
    maxWidth: 340
  })

  const qrImage = await QRCode.toDataURL(data.orderCode, {
    errorCorrectionLevel: "H",
    margin: 1,
    color: {
      dark: "#005E61",
      light: "#00000000"
    }
  })

  const qrBytes = Buffer.from(
    qrImage.replace(/^data:image\/png;base64,/, ""),
    "base64"
  )
  const qrEmbed = await pdfDoc.embedPng(qrBytes)

  page.drawImage(qrEmbed, {
    x: 408,
    y: 112,
    width: 132,
    height: 132
  })

  const codeSize = 10
  const codeWidth = font.widthOfTextAtSize(data.orderCode, codeSize)
  const qrCenterX = 408 + 132 / 2
  const codeX = qrCenterX - codeWidth / 2

  page.drawText(data.orderCode, {
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
    height: 42,
    opacity: 0.98
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}