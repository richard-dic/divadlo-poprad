import crypto from "crypto"

const SECRET = process.env.TICKET_SECRET!

export function signTicket(ticketCode: string) {
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(ticketCode)
    .digest("hex")
    .substring(0, 10)

  return `${ticketCode}.${signature}`
}

export function verifySignedTicket(signed: string) {
  if (!signed.includes(".")) return null

  const parts = signed.split(".")

  if (parts.length !== 2) return null

  const [ticketCode, signature] = parts

  if (!ticketCode || !signature) return null

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(ticketCode)
    .digest("hex")
    .substring(0, 10)

  if (signature !== expected) {
    return null
  }

  return ticketCode
}