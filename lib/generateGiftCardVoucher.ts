import { PDFDocument } from "pdf-lib"
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

export async function generateGiftCardVoucher(data: GiftCardVoucherData) {
  const pdfDoc = await PDFDocument.create()

  pdfDoc.registerFontkit(fontkit)

  const fontPath = path.join(process.cwd(), "fonts", "Roboto-Regular.ttf")
  const fontBytes = fs.readFileSync(fontPath)

  const font = await pdfDoc.embedFont(fontBytes)

  const qrImage = await QRCode.toDataURL(data.code)

  const page = pdfDoc.addPage([600, 320])
  const { height } = page.getSize()

  page.drawText("Divadlo Poprad", {
    x: 210,
    y: height - 50,
    size: 24,
    font
  })

  page.drawText("DARČEKOVÁ POUKÁŽKA", {
    x: 170,
    y: height - 95,
    size: 22,
    font
  })

  page.drawText(`Hodnota: ${data.amount.toFixed(2)} €`, {
    x: 50,
    y: height - 145,
    size: 18,
    font
  })

  page.drawText(`Kód: ${data.code}`, {
    x: 50,
    y: height - 175,
    size: 14,
    font
  })

  if (data.recipientName) {
    page.drawText(`Pre: ${data.recipientName}`, {
      x: 50,
      y: height - 205,
      size: 12,
      font
    })
  }

  if (data.recipientEmail) {
    page.drawText(`Email: ${data.recipientEmail}`, {
      x: 50,
      y: height - 225,
      size: 12,
      font
    })
  }

  if (data.message) {
    page.drawText(`Venovanie: ${data.message}`, {
      x: 50,
      y: height - 245,
      size: 12,
      font
    })
  }

  const qrImageBytes = Buffer.from(
    qrImage.replace(/^data:image\/png;base64,/, ""),
    "base64"
  )

  const qrEmbed = await pdfDoc.embedPng(qrImageBytes)

  page.drawImage(qrEmbed, {
    x: 420,
    y: height - 230,
    width: 120,
    height: 120
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