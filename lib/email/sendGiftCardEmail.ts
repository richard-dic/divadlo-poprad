import { sendEmail } from "@/lib/mailer"
import { downloadGeneratedFile, getGeneratedFileUrl } from "@/lib/storage"

export async function sendGiftCardEmail(
  email: string,
  code: string,
  amount: number,
  pdfFile: string
) {
  const storagePath = `giftcards/${pdfFile}`
  const pdfBuffer = await downloadGeneratedFile(storagePath)
  const downloadUrl = getGeneratedFileUrl(storagePath)

  await sendEmail({
    to: email,
    subject: "Darčeková poukážka – Divadlo Poprad",
    html: `
      <h2>Darčeková poukážka</h2>
      <p>Bola pre vás zakúpená darčeková poukážka.</p>
      <p><strong>Kód poukážky:</strong></p>
      <h1>${code}</h1>
      <p>Hodnota: ${amount} €</p>
      <p>Poukážku nájdete v prílohe alebo ju môžete stiahnuť tu:</p>
      <p><a href="${downloadUrl}">Stiahnuť poukážku</a></p>
    `,
    attachments: [
      {
        filename: "poukazka.pdf",
        content: pdfBuffer,
      },
    ],
  })
}