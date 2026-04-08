import { resend } from "@/lib/resend"

export async function sendRescheduleEmail(
  email: string,
  oldDate: Date,
  newDate: Date
) {
  try {
    await resend.emails.send({
      from: "Divadlo <onboarding@resend.dev>",
      to: email,
      subject: "Zmena termínu predstavenia",
      html: `
        <p>Dobrý deň,</p>

        <p>termín predstavenia bol zmenený.</p>

        <p><b>Pôvodný:</b> ${oldDate.toLocaleString("sk-SK")}</p>
        <p><b>Nový:</b> ${newDate.toLocaleString("sk-SK")}</p>

        <p>Ak vám nový termín nevyhovuje, kontaktujte nás.</p>
      `
    })
  } catch (err) {
    console.error("RESCHEDULE EMAIL ERROR:", err)
  }
}