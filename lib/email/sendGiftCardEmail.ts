import { Resend } from "resend"
import fs from "fs"
import path from "path"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendGiftCardEmail(
  email: string,
  code: string,
  amount: number,
  pdfFile: string
) {

  const filePath = path.join(process.cwd(), "public", "giftcards", pdfFile)

  const pdfBuffer = fs.readFileSync(filePath)

  const downloadUrl =
    `${process.env.NEXT_PUBLIC_BASE_URL}/giftcards/${pdfFile}`

  await resend.emails.send({

    from: process.env.EMAIL_FROM!,

    to: email,

    subject: "Darčeková poukážka – Divadlo Poprad",

    html: `
      <h2>Darčeková poukážka</h2>

      <p>Bola pre vás zakúpená darčeková poukážka.</p>

      <p><strong>Kód poukážky:</strong></p>

      <h1>${code}</h1>

      <p>Hodnota: ${amount} €</p>

      <p>
        Poukážku nájdete v prílohe alebo ju môžete stiahnuť tu:
      </p>

      <p>
        <a href="${downloadUrl}">
          Stiahnuť poukážku
        </a>
      </p>
    `,

    attachments: [
      {
        filename: "poukazka.pdf",
        content: pdfBuffer
      }
    ]

  })

}