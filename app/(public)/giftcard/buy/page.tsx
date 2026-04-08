"use client"

import { useState } from "react"

export default function GiftCardBuyPage() {

  const [amount, setAmount] = useState(20)
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ email?: string; amount?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; amount?: string } = {}

    if (!amount || amount <= 0) {
      newErrors.amount = "Zadajte platnú sumu"
    }

    if (!email.trim()) {
      newErrors.email = "Zadajte email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Neplatný email"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buy = async () => {
    if (!validate()) return

    const res = await fetch("/api/giftcard/buy", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        amount,
        email
      })

    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba")
      return
    }

    window.location.href = data.url

  }

  return (
    <div className="container section" style={{ maxWidth: 700 }}>
      <h1 className="headingPrimary" style={{ textAlign: "center" }}>
        DARČEKOVÁ POUKÁŽKA
      </h1>

      <div className="newsletterWrapper">
        <div className="newsletterCard">

          <div className="formGroup">
            <label>HODNOTA POUKÁŽKY *</label>
            <div className="giftOptions">
              {[20, 30, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`giftOption ${amount === val ? "active" : ""}`}
                  onClick={() => setAmount(val)}
                >
                  {val} €
                </button>
              ))}
            </div>
          </div>

          <div className="formGroup">
            <label>VLASTNÁ SUMA</label>
            <input
              className="input"
              type="number"
              placeholder="Zadajte sumu"
              value={amount}
              onChange={(e) => {
                setAmount(Number(e.target.value))
                setErrors((prev) => ({ ...prev, amount: undefined }))
              }}
            />
            {errors.amount && (
              <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {errors.amount}
              </div>
            )}
          </div>

          <div className="formGroup">
            <label>EMAIL PRÍJEMCU *</label>
            <input
              className="input"
              placeholder="Zadajte email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((prev) => ({ ...prev, email: undefined }))
              }}
            />
            {errors.email && (
              <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {errors.email}
              </div>
            )}
          </div>

          <button
            className="primaryBtn"
            onClick={buy}
            style={{ width: "100%", marginTop: 10 }}
          >
            Pokračovať na platbu
          </button>

        </div>
      </div>
    </div>
  )

}