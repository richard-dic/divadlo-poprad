"use client"

import { useState } from "react"

export default function CreateGiftCard() {
  const [amount, setAmount] = useState("")

  const create = async () => {
    const res = await fetch("/api/admin/giftcards/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Number(amount)
      })
    })

    const data = await res.json()

    if (!data.id) {
      alert(data.error || "Chyba")
      return
    }

    alert(`Poukážka vytvorená: ${data.code}`)
    setAmount("")
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Vytvoriť darčekovú poukážku</h1>

      <input
        placeholder="Suma €"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        style={{ marginLeft: "10px" }}
        onClick={create}
      >
        Vytvoriť
      </button>
    </div>
  )
}