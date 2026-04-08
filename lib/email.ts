import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendGiftCardEmail(
  email: string,
  code: string,
  amount: number
) {

  await resend.emails.send({

    from: "Divadlo Poprad <onboarding@resend.dev>",

    to: email,

    subject: "Darčeková poukážka – Divadlo Poprad",

    html: `
      <h1>Darčeková poukážka</h1>

      <p>Ďakujeme za nákup.</p>

      <p><strong>Kód poukážky:</strong> ${code}</p>

      <p><strong>Hodnota:</strong> ${amount} €</p>

      <p>Poukážku môžete použiť pri nákupe vstupeniek na stránke divadla.</p>
    `
  })

}