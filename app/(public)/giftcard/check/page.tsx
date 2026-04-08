"use client"

import { useState } from "react"

type Transaction = {
  id: number
  amount: number
  type: string
  createdAt: string
  note: string | null
}

type GiftCardData = {
  code: string
  initialAmount: number
  remainingAmount: number
  active: boolean
  expiresAt: string | null
  transactions: Transaction[]
}

export default function GiftCardCheckPage() {

  const formatCode = (value: string) => {
    const cleaned = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10) // max 10 chars without hyphens (4-4-2)

    const part1 = cleaned.slice(0, 4)
    const part2 = cleaned.slice(4, 8)
    const part3 = cleaned.slice(8, 10)

    let result = part1
    if (part2) result += "-" + part2
    if (part3) result += "-" + part3

    return result
  }

  const [code, setCode] = useState("")
  const [data, setData] = useState<GiftCardData | null>(null)
  const [error, setError] = useState("")

  const check = async () => {

    setError("")
    setData(null)

    const res = await fetch("/api/giftcard/check", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ code })

    })

    const result = await res.json()

    if (!res.ok) {
      setError(result.error || "Chyba")
      return
    }

    setData(result)

  }

  return (
    <div className="container section" style={{ maxWidth: 700 }}>
      <h1 className="headingPrimary" style={{ textAlign: "center" }}>
        KONTROLA POUKÁŽKY
      </h1>

      <div className="newsletterWrapper">
        <div className="newsletterCard">

          <div className="formGroup">
            <label>KÓD POUKÁŽKY *</label>
            <input
              className="input"
              placeholder="Zadajte kód poukážky"
              value={code}
              maxLength={12}
              onChange={(e) => setCode(formatCode(e.target.value))}
            />
          </div>

          <button
            className="primaryBtn"
            onClick={check}
            style={{ width: "100%", marginTop: 10 }}
          >
            Skontrolovať
          </button>

          {error && (
            <p style={{ color: "red", marginTop: 10 }}>
              {error}
            </p>
          )}

        </div>
      </div>

      {data && (
        <div className="newsletterWrapper" style={{ marginTop: 30 }}>
          <div className="newsletterCard">

            <h2 style={{ marginBottom: 30, marginTop: 0 }}>Informácie o poukážke</h2>

            <p><strong>Kód:</strong> {data.code}</p>
            <p><strong>Pôvodná hodnota:</strong> {data.initialAmount} €</p>
            <p><strong>Zostatok:</strong> {data.remainingAmount} €</p>
            <p><strong>Aktívna:</strong> {data.active ? "Áno" : "Nie"}</p>

            {data.expiresAt && (
              <p>
                <strong>Platná do:</strong> {new Date(data.expiresAt).toLocaleDateString()}
              </p>
            )}

            <h3 style={{ marginTop: 20 }}>História použitia</h3>

            {data.transactions.length === 0 && (
              <p>Poukážka ešte nebola použitá.</p>
            )}

            {data.transactions.map((t) => (
              <div key={t.id} style={{ marginTop: 5 }}>
                <p style={{ color: "#666" }}>
                  -{t.amount} € • {new Date(t.createdAt).toLocaleString()}
                </p>
              </div>
            ))}

          </div>
        </div>
      )}

    </div>
  )

}