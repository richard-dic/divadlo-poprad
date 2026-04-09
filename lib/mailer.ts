import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

type SendEmailParams = {
  to: string | string[]
  subject: string
  html: string
  attachments?: {
    filename: string
    content: Buffer
  }[]
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: SendEmailParams) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    attachments,
  })
}