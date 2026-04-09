import fs from "fs"
import path from "path"
import { sendEmail } from "@/lib/mailer"

export async function sendTicketEmail(
  email: string,
  orderId: number,
  pdfFile: string
) {
  const filePath = path.join(process.cwd(), "public", "tickets", pdfFile)
  const pdfBuffer = fs.readFileSync(filePath)

  const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/${pdfFile}`

  await sendEmail({
    to: email,
    subject: "Vaše vstupenky – Divadlo Poprad",
    html: `
      <h2>Ďakujeme za nákup</h2>
      <p>Vaša objednávka č. <strong>${orderId}</strong> bola úspešne zaplatená.</p>
      <p>V prílohe nájdete vstupenky vo formáte PDF.</p>
      <p>Ak by sa príloha nezobrazila, môžete si vstupenky stiahnuť aj tu:</p>
      <p><a href="${downloadUrl}">Stiahnuť vstupenky</a></p>
      <p>Tešíme sa na vašu návštevu.</p>
      <p>Divadlo Poprad</p>
    `,
    attachments: [
      {
        filename: "vstupenky.pdf",
        content: pdfBuffer,
      },
    ],
  })
}