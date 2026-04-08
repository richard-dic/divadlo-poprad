import { NextResponse } from "next/server"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const data = await req.json()

  // 🔥 uloženie do DB
  const record = await prisma.schoolInquiry.create({
    data: {
      meno: data.meno,
      email: data.email,
      telefon: data.telefon,
      skola: data.skola,
      funkcia: data.funkcia,
      zaujem: data.zaujem.join(", "),
      poznamka: data.poznamka
    }
  })

  // 🔥 email
  await resend.emails.send({
    from: "Divadlo <onboarding@resend.dev>",
    to: ["tvojmail@gmail.com"],
    subject: "Nový záujem o predstavenie",
    html: `
      <h2>Nový formulár</h2>
      <p><b>Meno:</b> ${data.meno}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Telefón:</b> ${data.telefon}</p>
      <p><b>Škola:</b> ${data.skola}</p>
      <p><b>Funkcia:</b> ${data.funkcia}</p>
      <p><b>Záujem:</b> ${data.zaujem.join(", ")}</p>
      <p><b>Poznámka:</b> ${data.poznamka}</p>
    `
  })

  return NextResponse.json({ success: true })
}