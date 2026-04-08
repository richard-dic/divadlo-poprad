"use client"

import { useCallback, useEffect, useState } from "react"

type PriceData = {
  seats: number
  seatPrice: number
  totalPrice: number
  giftAmount: number
  payable: number
}

export default function CheckoutForm({
  terminId,
  sessionId
}: {
  terminId: number
  sessionId: string
}) {
  const [meno, setMeno] = useState("")
  const [email, setEmail] = useState("")
  const [telefon, setTelefon] = useState("")
  const [giftCode, setGiftCode] = useState("")
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [errors, setErrors] = useState<{ meno?: string; email?: string; telefon?: string }>({})
  const validate = () => {
    const newErrors: { meno?: string; email?: string; telefon?: string } = {}

    if (!meno.trim()) {
      newErrors.meno = "Zadajte meno"
    }

    if (!email.trim()) {
      newErrors.email = "Zadajte email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Neplatný email"
    }

    if (!telefon.trim()) {
      newErrors.telefon = "Zadajte telefón"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculate = useCallback(async (code: string) => {
    const res = await fetch("/api/order/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        terminId,
        sessionId,
        giftCode: code
      })
    })

    if (!res.ok) return

    const data: PriceData = await res.json()
    setPriceData(data)
  }, [terminId, sessionId])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const res = await fetch("/api/order/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          terminId,
          sessionId,
          giftCode: ""
        })
      })

      if (!res.ok) return

      const data: PriceData = await res.json()

      if (!cancelled) {
        setPriceData(data)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [terminId, sessionId])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (giftCode.length === 12) {
        void calculate(giftCode)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [giftCode, calculate])

  const submit = async () => {
    if (!validate()) return
    const res = await fetch("/api/objednavka", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        terminId,
        sessionId,
        meno,
        email,
        telefon,
        giftCode
      })
    })

    if (!res.ok) {
      const error = await res.json().catch(() => null)
      alert(error?.error || "Nepodarilo sa vytvoriť objednávku")
      return
    }

    const order = await res.json()

    if (!order.id) {
      alert("Nepodarilo sa vytvoriť objednávku")
      return
    }

    if (priceData?.payable === 0) {
      window.location.href = `/payment-success?orderId=${order.id}`
      return
    }

    const stripeRes = await fetch("/api/payment/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId: order.id
      })
    })

    if (!stripeRes.ok) {
      const error = await stripeRes.json().catch(() => null)
      alert(error?.error || "Chyba pri vytváraní platby")
      return
    }

    const stripeData = await stripeRes.json()

    if (!stripeData.url) {
      alert("Stripe URL sa nepodarilo získať")
      return
    }

    window.location.href = stripeData.url
  }

  return (
    <div>
      {/* VAŠE ÚDAJE */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
        }}
      >
        <h2 className="headingSecondary" style={{ marginTop: 0 }}>Vaše údaje</h2>

        <div className="formGroup">
          <label>Meno*</label>
          <input
            className="input"
            value={meno}
            onChange={(e) => {
              setMeno(e.target.value)
              setErrors((prev) => ({ ...prev, meno: undefined }))
            }}
          />
          {errors.meno && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.meno}
            </div>
          )}
        </div>

        <div className="formGroup">
          <label>Email*</label>
          <input
            className="input"
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

        <div className="formGroup">
          <label>Telefón*</label>
          <input
            className="input"
            value={telefon}
            onChange={(e) => {
              setTelefon(e.target.value)
              setErrors((prev) => ({ ...prev, telefon: undefined }))
            }}
          />
          {errors.telefon && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
              {errors.telefon}
            </div>
          )}
        </div>
      </div>

      {/* DARČEKOVÁ POUKÁŽKA */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
          marginTop: 20
        }}
      >
        <h2 className="headingSecondary" style={{ marginTop: 0 }}>Darčeková poukážka</h2>

        <div className="formGroup">
          <label>Kód poukážky</label>
          <input
            className="input"
            value={giftCode}
            onChange={(e) => {
              let val = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()

              if (val.length > 4 && val.length <= 8) {
                val = val.slice(0, 4) + "-" + val.slice(4)
              } else if (val.length > 8) {
                val =
                  val.slice(0, 4) +
                  "-" +
                  val.slice(4, 8) +
                  "-" +
                  val.slice(8, 10)
              }

              setGiftCode(val)

              // 🔥 okamžité prepočítanie keď je kód kompletný
              if (val.length === 12) {
                void calculate(val)
              }
            }}
            maxLength={12}
            placeholder="XXXX-XXXX-XX"
            style={{ textAlign: "center", letterSpacing: "2px" }}
          />
        </div>
        {giftCode.length === 12 && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            {priceData?.giftAmount && priceData.giftAmount > 0 ? (
              <span style={{ color: "#2bb3b1", fontWeight: 600 }}>
                Poukážka uplatnená (-{priceData.giftAmount} €)
              </span>
            ) : (
              <span style={{ color: "red" }}>
                Neplatný alebo nepoužiteľný kód
              </span>
            )}
          </div>
        )}
      </div>

      {/* PREHĽAD OBJEDNÁVKY */}
      {priceData && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            marginTop: 20
          }}
        >
          <h2 className="headingSecondary" style={{ marginTop: 0 }}>Prehľad objednávky</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Počet miest</span>
              <strong>{priceData.seats}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Cena za miesto</span>
              <strong>{priceData.seatPrice} €</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Medzisúčet</span>
              <strong>{priceData.totalPrice} €</strong>
            </div>

            {priceData.giftAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#2bb3b1",
                  fontWeight: 600
                }}
              >
                <span>Zľava (poukážka)</span>
                <span>-{priceData.giftAmount} €</span>
              </div>
            )}

            <hr />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700 }}>
                Na zaplatenie
              </span>
              <span style={{ fontSize: 24, fontWeight: 800 }}>
                {priceData.payable} €
              </span>
            </div>
          </div>

          <div style={{ marginTop: 20, fontSize: 13, color: "#666" }}>
            Oboznámil som sa s obchodnými podmienkami a súhlasím s povinnosťou platby.
          </div>

          <button
            className="buyBtn"
            style={{
              marginTop: 16,
              width: "100%",
              padding: "14px",
              fontSize: 16
            }}
            onClick={submit}
          >
            Pokračovať na platbu
          </button>
        </div>
      )}
    </div>
  )
}