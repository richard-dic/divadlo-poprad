"use client"

import { useState } from "react"

export default function CreateGiftCardForm() {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    const value = Number(amount)

    if (!value || value <= 0) {
      setError("Zadaj platnú sumu")
      return
    }

    setError("")
    setLoading(true)

    const res = await fetch("/api/admin/giftcards/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount: value })
    })

    setLoading(false)

    if (res.ok) {
      setAmount("")
      location.reload()
    } else {
      const data = await res.json()
      setError(data.error || "Chyba")
    }
  }

  return (
    <div
      style={{
        marginTop: 16,
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #eee",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        width: "100%"
      }}
    >
      <div className="formGroup">
        <label className="formLabel">Suma (€)</label>
        <input
          className="input"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {error && <div className="formError">{error}</div>}

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <button
          className="primaryBtn"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Vytváram..." : "Vytvoriť"}
        </button>
      </div>
    </div>
  )
}