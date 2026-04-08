import { resend } from "@/lib/resend"

type CancelEmailData = {
  email: string
  orderCode: string
  predstavenie: string
  datum: Date
  stripeReturned: number
  giftReturned: number
}

export async function sendCancelEmail(data: CancelEmailData) {
  const {
    email,
    orderCode,
    predstavenie,
    datum,
    stripeReturned,
    giftReturned
  } = data

  const totalReturned = stripeReturned + giftReturned

  await resend.emails.send({
    from: "Divadlo <onboarding@resend.dev>",
    to: email,
    subject: "Zrušenie objednávky",
    html: `
      <p>Dobrý deň,</p>

      <p>Vaša objednávka <b>${orderCode}</b> bola zrušená.</p>

      <p><b>Predstavenie:</b> ${predstavenie}</p>
      <p><b>Dátum:</b> ${datum.toLocaleString("sk-SK")}</p>

      <hr />

      <p><b>Celková vrátená suma:</b> ${totalReturned.toFixed(2)} €</p>

      ${
        stripeReturned > 0
          ? `<p><b>Vrátené na platobnú kartu / účet:</b> ${stripeReturned.toFixed(2)} €</p>`
          : ""
      }

      ${
        giftReturned > 0
          ? `<p><b>Vrátené na darčekovú kartu:</b> ${giftReturned.toFixed(2)} €</p>`
          : ""
      }

      ${
        stripeReturned > 0
          ? `<p>Refundácia kartovej platby môže trvať 1 až 5 pracovných dní v závislosti od banky.</p>`
          : ""
      }

      ${
        giftReturned > 0
          ? `<p>Suma na darčekovej karte bola obnovená okamžite.</p>`
          : ""
      }

      <p>Ak máte otázky, kontaktujte prosím vedenie alebo pokladňu divadla.</p>

      <p>Ďakujeme za pochopenie.</p>
    `
  })
}