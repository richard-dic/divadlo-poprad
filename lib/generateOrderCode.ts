import crypto from "crypto"

export function generateOrderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

  function part(length: number): string {
    const bytes = crypto.randomBytes(length)
    let result = ""

    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length]
    }

    return result
  }

  return `ORD-${part(4)}-${part(4)}`
}