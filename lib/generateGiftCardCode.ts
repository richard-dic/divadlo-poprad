import crypto from "crypto"

export function generateGiftCardCode(): string {

  const raw = crypto.randomBytes(5).toString("hex").toUpperCase()

  const parts = raw.match(/.{1,4}/g) || []

  return parts.join("-")

}