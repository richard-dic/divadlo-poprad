import { sendEmail } from "@/lib/mailer"
import { downloadGeneratedFile, getGeneratedFileUrl } from "@/lib/storage"

export async function sendTicketEmail(
  email: string,
  orderId: number,
  pdfFile: string
) {
  const storagePath = `tickets/${pdfFile}`
  const pdfBuffer = await downloadGeneratedFile(storagePath)
  const downloadUrl = getGeneratedFileUrl(storagePath)

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