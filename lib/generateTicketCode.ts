import crypto from "crypto"

export function generateTicketCode() {

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

  function part(length: number) {

    const bytes = crypto.randomBytes(length)

    let result = ""

    for (let i = 0; i < length; i++) {

      result += chars[bytes[i] % chars.length]

    }

    return result

  }

  return `TKT-${part(4)}-${part(4)}-${part(4)}`

}