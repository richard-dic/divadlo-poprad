import { sendEmail } from "@/lib/mailer"

type NewsletterEmailData = {
  email: string
  name?: string | null
}

export async function sendNewsletterWelcomeEmail(data: NewsletterEmailData) {
  const { email, name } = data
  const greeting = name ? `Ahoj ${name},` : "Ahoj,"

  await sendEmail({
    to: email,
    subject: "Vitaj v našom newsletteri 🎭",
    html: `
      <p>${greeting}</p>
      <p>ďakujeme, že si sa prihlásil do newslettera Divadla Poprad.</p>
      <p>Budeš medzi prvými, ktorí sa dozvedia o:</p>
      <ul>
        <li>nových predstaveniach</li>
        <li>špeciálnych akciách a zľavách</li>
        <li>exkluzívnych novinkách</li>
      </ul>
      <p>Tešíme sa na tvoju návštevu 🎟️</p>
      <br />
      <p>Tím Divadla Poprad</p>
    `,
  })
}