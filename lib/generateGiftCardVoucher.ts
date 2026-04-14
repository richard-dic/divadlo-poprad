import { PDFDocument, PDFPage, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import fs from "fs"
import path from "path"
import QRCode from "qrcode"
import { uploadGeneratedFile } from "@/lib/storage"

type GiftCardVoucherData = {
  code: string
  amount: number
  recipientName?: string | null
  recipientEmail?: string | null
  message?: string | null
}

const PAGE_WIDTH = 300
const PAGE_HEIGHT = 140
const ACCENT = rgb(0 / 255, 94 / 255, 97 / 255)
const TEXT = rgb(0, 0, 0)
const MUTED = rgb(65 / 255, 65 / 255, 65 / 255)

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
    size: 8,
    font,
    color: ACCENT
  })

  page.drawText(value, {
    x: x + 54,
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

export async function generateGiftCardVoucher(data: GiftCardVoucherData) {
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

  const watermarkMaxWidth = 120
  const watermarkScale = watermarkMaxWidth / logoImage.width
  const watermarkDims = logoImage.scale(watermarkScale)
  const watermarkX = (PAGE_WIDTH - watermarkDims.width) / 2
  const watermarkY = (PAGE_HEIGHT - watermarkDims.height) / 2

  page.drawImage(logoImage, {
    x: watermarkX,
    y: watermarkY,
    width: watermarkDims.width,
    height: watermarkDims.height,
    opacity: 0.14
  })

  page.drawText("DARČEKOVÁ POUKÁŽKA", {
    x: 18,
    y: PAGE_HEIGHT - 18,
    size: 8,
    font,
    color: ACCENT
  })

  page.drawText("SUMA DARČEKOVEJ POUKÁŽKY", {
    x: 18,
    y: PAGE_HEIGHT - 44,
    size: 7,
    font,
    color: ACCENT
  })

  const amountText = `${data.amount.toFixed(2)} €`
  const amountSize = 24

  drawBoldText(page, amountText, {
    x: 18,
    y: PAGE_HEIGHT - 72,
    size: amountSize,
    font,
    color: TEXT,
    maxWidth: 150
  })

  let currentY = PAGE_HEIGHT - 84

  if (data.recipientName) {
    drawLabelValue(page, font, "Pre", data.recipientName, 18, currentY, 8, 90)
    currentY -= 11
  }

  if (data.recipientEmail) {
    drawLabelValue(page, font, "Email", data.recipientEmail, 18, currentY, 7, 90)
    currentY -= 11
  }

  if (data.message) {
    drawLabelValue(page, font, "Venovanie", data.message, 18, currentY, 7, 90)
  }

  const qrImage = await QRCode.toDataURL(data.code, {
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

  const qrSize = 68
  const qrX = PAGE_WIDTH - qrSize - 18
  const qrY = 40

  page.drawImage(qrEmbed, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize
  })

  const codeSize = 7
  const codeWidth = font.widthOfTextAtSize(data.code, codeSize)
  const qrCenterX = qrX + qrSize / 2
  const codeX = qrCenterX - codeWidth / 2

  page.drawText(data.code, {
    x: codeX,
    y: 30,
    size: codeSize,
    font,
    color: MUTED
  })

  page.drawText(
    "Pri kúpe lístkov zadajte kód pod QR. Odpočíta sa najvyššia možná hodnota.",
    {
      x: 18,
      y: 18,
      size: 6,
      font,
      color: MUTED
    }
  )

  page.drawImage(tatryImage, {
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: 10,
    opacity: 0.98
  })

  const pdfBytes = await pdfDoc.save()
  const fileName = `giftcard-${data.code}.pdf`

  await uploadGeneratedFile(
    "giftcards",
    fileName,
    Buffer.from(pdfBytes),
    "application/pdf"
  )

  return fileName
}