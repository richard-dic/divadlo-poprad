"use client"

import { useState } from "react"

export default function GiftCardBalancePage() {
  const [code, setCode] = useState("")
  const [balance, setBalance] = useState<number | null>(null)

  const check = async () => {
    const res = await fetch("/api/giftcard/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    })

    const data = await res.json()

    if (!data.valid) {
      alert(data.message)
      return
    }

    setBalance(data.remainingAmount)
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Kontrola zostatku darčekovej poukážky</h1>

      <input
        placeholder="Zadaj kód poukážky"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={check}>
        Skontrolovať
      </button>

      {balance !== null && (
        <p>Zostatok: {balance.toFixed(2)} €</p>
      )}
    </div>
  )
}