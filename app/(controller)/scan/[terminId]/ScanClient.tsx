"use client"

import { useEffect, useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import Link from "next/link"

type Seat = {
  id: number
  rad: number | null
  cislo: number | null
  stol: number | null
  stolicka: number | null
  typMiesta: string
  status: "FREE" | "SOLD" | "CHECKED"
}

type TicketResult = {
  type: "TICKET"
  status: "VALID" | "USED" | "INVALID" | "WRONG_EVENT"
  ticketId?: number
  seat?: Seat
}

type OrderResult = {
  type: "ORDER"
  status: "RESERVED_UNPAID" | "PAID" | "USED" | "INVALID" | "WRONG_EVENT"
  orderId?: number
  totalAmount?: number
  email?: string | null
  count?: number
  seats?: Seat[]
}

type ScanResult = TicketResult | OrderResult | { status: "INVALID" | "ERROR" }

export default function ScanClient({ terminId }: { terminId: number }) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [hallName, setHallName] = useState("")
  const [terminInfo, setTerminInfo] = useState<{
    date: string
    time: string
    title?: string
  } | null>(null)

  const [result, setResult] = useState<ScanResult | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [manualType, setManualType] = useState<"TKT" | "ORD">("TKT")
  const [giftCode, setGiftCode] = useState("")
  const [receiptEmail, setReceiptEmail] = useState("")
  const [sendReceipt, setSendReceipt] = useState(false)

  const [scanLocked, setScanLocked] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [payingOrder, setPayingOrder] = useState(false)
  const [checkingInOrder, setCheckingInOrder] = useState(false)

  const [preview, setPreview] = useState<{
    originalAmount: number
    discount: number
    finalAmount: number
  } | null>(null)

  useEffect(() => {
    setManualCode("TKT-")
  }, [])

  async function loadSeats() {
    const res = await fetch("/api/scan/hall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminId })
    })

    if (!res.ok) return

    const data = await res.json()

    setSeats(data.seats)
    setHallName(data.hallName)

    if (data.date && data.time) {
      setTerminInfo({
        date: data.date,
        time: data.time,
        title: data.title
      })
    }
  }

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (cancelled) return
      await loadSeats()
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [terminId])

  useEffect(() => {
    const interval = setInterval(() => {
      void loadSeats()
    }, 2000)

    return () => clearInterval(interval)
  }, [terminId])

  async function verifyCode(code: string) {
    if (!terminId) {
      console.error("terminId is missing")
      return
    }
    const trimmed = code.trim().toUpperCase()

    if (!trimmed) {
      setResult({ status: "INVALID" })
      setScanLocked(false)
      return
    }

    try {
      const res = await fetch("/api/scan/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: trimmed,
          terminId
        })
      })

      const data = await res.json()

      setResult(data)
      setPreview(null)
      setManualCode("")

      if ("type" in data && data.type === "ORDER") {
        setReceiptEmail(data.email ?? "")
      } else {
        setReceiptEmail("")
      }

      setSendReceipt(false)
    } catch {
      setResult({ status: "ERROR" })
    } finally {
      setScanLocked(false)
    }
  }

  async function checkinTicket(ticketId: number) {
    if (checkingIn) return

    setCheckingIn(true)

    try {
      const res = await fetch("/api/ticket/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ticketId })
      })

      const data = await res.json()

      if (data.status === "CHECKED_IN") {
        await loadSeats()
        setResult(null)
      }
    } finally {
      setCheckingIn(false)
    }
  }

  async function payOrder(orderId: number) {
    if (payingOrder) return

    setPayingOrder(true)

    try {
      const res = await fetch("/api/order/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId,
          giftCode,
          email: sendReceipt ? receiptEmail.trim() : null
        })
      })

      const data = await res.json()

      if (data.status === "PAID") {
        alert(`Zaplatené ✅\nZľava: ${data.discount || 0} €`)
        await loadSeats()

        setResult((prev) => {
          if (!prev || !("type" in prev) || prev.type !== "ORDER") return prev

          return {
            ...prev,
            status: "PAID"
          }
        })

        setGiftCode("")
      } else if (data.error) {
        alert(data.error)
      }
    } finally {
      setPayingOrder(false)
    }
  }

  async function previewGift(orderId: number, code: string) {
    if (!code.trim()) {
      setPreview(null)
      return
    }

    const res = await fetch("/api/order/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId,
        giftCode: code
      })
    })

    const data = await res.json()

    if (!data.error) {
      setPreview(data)
    }
  }

  async function checkinOrder(orderId: number) {
    if (checkingInOrder) return

    setCheckingInOrder(true)

    try {
      const res = await fetch("/api/order/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId })
      })

      const data = await res.json()

      if (data.status === "CHECKED_IN") {
        await loadSeats()
        setResult(null)
      } else if (data.error) {
        alert(data.error)
      }
    } finally {
      setCheckingInOrder(false)
    }
  }

  const groupedSeats: Record<string, Seat[]> = {}

  seats.forEach((seat) => {
    const key =
      seat.typMiesta === "ROW_SEAT"
        ? `row-${seat.rad}`
        : `table-${seat.stol}`

    if (!groupedSeats[key]) groupedSeats[key] = []
    groupedSeats[key].push(seat)
  })

  function renderSeat(seat: Seat) {
    let bg = "#27A7B2" // FREE (default)

    if (seat.status === "CHECKED") bg = "#d4a017"
    if (seat.status === "SOLD") bg = "#1E4D4F"

    const isHighlighted =
      result && "type" in result && result.type === "TICKET" && result.seat?.id === seat.id

    const isChild = seat.typMiesta === "CHILD_SEAT"

    return (
      <div
        key={seat.id}
        style={{
          width: 36,
          height: 40,
          lineHeight: "40px",
          margin: 4,
          background: bg,
          borderRadius: isChild ? "50%" : "8px 8px 14px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          border: isHighlighted ? "3px solid gold" : "1px solid rgba(0,0,0,0.1)",
          opacity: seat.status === "SOLD" ? 0.35 : 1
        }}
      >
        {seat.cislo ?? seat.stolicka}
      </div>
    )
  }

  return (
    <div className="adminContainer" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>
          <Link
            href="/scan"
            style={{ color: "#27A7B2", textDecoration: "none", fontWeight: 500 }}
          >
            ← Späť na výber termínu
          </Link>

          <span style={{ margin: "0 6px", color: "#999" }}>|</span>

          <Link
            href={`/predaj/${terminId}`}
            style={{ color: "#333", textDecoration: "none" }}
          >
            Prejsť na predaj
          </Link>
        </div>

        <h1 className="headingPrimary" style={{ margin: 0 }}>
          Skenovanie vstupeniek
        </h1>
      </div>

      {terminInfo && (
        <div
          style={{
            background: "#eaf7ff",
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
            border: "1px solid #cce7ff"
          }}
        >
          <div style={{ fontSize: 13, color: "#0077cc", fontWeight: 600 }}>
            Aktuálne skenuješ
          </div>

          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>
            {terminInfo.title || "Predstavenie"}
          </div>

          <div style={{ color: "#333", marginTop: 4 }}>
            {terminInfo.date} • <b>{terminInfo.time}</b>
          </div>

          {hallName && (
            <div style={{ marginTop: 4, fontSize: 13, color: "#666" }}>
              Sála: {hallName}
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: 600, margin: "0 auto", width: "100%" }}>
        {/* SCANNER */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            marginBottom: 20
          }}
        >
          <h3 className="headingTertiary" style={{ marginBottom: 12, marginTop: 0 }}>
            QR skener
          </h3>

          <div style={{ borderRadius: 12, overflow: "hidden" }}>
            <Scanner
              scanDelay={500}
              onScan={(codes) => {
                if (!codes?.length) return
                if (scanLocked) return

                const value = codes[0].rawValue

                setScanLocked(true)
                void verifyCode(value)
                setTimeout(() => setScanLocked(false), 1500)
              }}
            />
          </div>

          {scanLocked && (
            <div style={{ marginTop: 10, color: "orange", fontWeight: "bold" }}>
              Spracováva sa scan...
            </div>
          )}
        </div>

        {/* INPUTY */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
          }}
        >
          <h3 className="headingTertiary" style={{ marginBottom: 12, marginTop: 0 }}>
            Ručné zadanie
          </h3>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
            Vyber typ kódu a potom zadaj iba písmená a čísla. Pomlčky sa doplnia automaticky.
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => {
                setManualType("TKT")
                setManualCode("TKT-")
              }}
              style={{
                background: manualType === "TKT" ? "var(--primary)" : "#fff",
                color: manualType === "TKT" ? "#fff" : "var(--primary)",
                border: "1px solid var(--primary)",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Ticket
            </button>

            <button
              type="button"
              onClick={() => {
                setManualType("ORD")
                setManualCode("ORD-")
              }}
              style={{
                background: manualType === "ORD" ? "var(--primary)" : "#fff",
                color: manualType === "ORD" ? "#fff" : "var(--primary)",
                border: "1px solid var(--primary)",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Order
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder={manualType === "TKT" ? "TKT-XXXX-XXXX-XXXX" : "ORD-XXXX-XXXX"}
              value={manualCode}
              onChange={(e) => {
                let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")

                if (manualType === "TKT") {
                  raw = raw.replace(/^TKT/, "")
                  raw = raw.slice(0, 12)

                  const part1 = raw.slice(0, 4)
                  const part2 = raw.slice(4, 8)
                  const part3 = raw.slice(8, 12)

                  let formatted = "TKT"
                  if (part1) formatted += `-${part1}`
                  if (part2) formatted += `-${part2}`
                  if (part3) formatted += `-${part3}`

                  setManualCode(formatted)
                } else {
                  raw = raw.replace(/^ORD/, "")
                  raw = raw.slice(0, 8)

                  const part1 = raw.slice(0, 4)
                  const part2 = raw.slice(4, 8)

                  let formatted = "ORD"
                  if (part1) formatted += `-${part1}`
                  if (part2) formatted += `-${part2}`

                  setManualCode(formatted)
                }
              }}
              className="input"
              style={{ flex: 1 }}
            />

            <button
              className="primaryBtn"
              onClick={() => void verifyCode(manualCode)}
            >
              Overiť
            </button>
          </div>
        </div>
      </div>

      {result && !("type" in result) && (
        <div style={{ marginTop: 20, color: "red", fontWeight: "bold" }}>
          {result.status === "INVALID" && "Neplatný kód"}
          {result.status === "ERROR" && "Nastala chyba pri overení"}
        </div>
      )}

      {result && "type" in result && result.type === "TICKET" && (
        <div
          style={{
            marginTop: 30,
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
          }}
        >
          <h3>Vstupenka</h3>

          <div>Status: {result.status}</div>

          {result.seat && (
            <div style={{ marginTop: 10 }}>
              {result.seat.typMiesta === "ROW_SEAT"
                ? `Rad ${result.seat.rad} – Miesto ${result.seat.cislo}`
                : `Stôl ${result.seat.stol} – Stolička ${result.seat.stolicka}`}
            </div>
          )}

          {result.status === "VALID" && result.ticketId && (
            <button
              style={{ marginTop: 15 }}
              onClick={() => void checkinTicket(result.ticketId!)}
              disabled={checkingIn}
            >
              {checkingIn ? "Spracováva sa..." : "Povoliť vstup"}
            </button>
          )}

          {result.status === "USED" && (
            <div style={{ marginTop: 15, color: "red" }}>
              Táto vstupenka už bola použitá.
            </div>
          )}
        </div>
      )}

      {result && "type" in result && result.type === "ORDER" && (
        <div
          style={{
            marginTop: 30,
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
          }}
        >
          <h3>Objednávka / rezervácia</h3>

          <div>Status: {result.status}</div>
          <div>Počet miest: {result.count ?? 0}</div>

          {preview ? (
            <div style={{ marginTop: 10 }}>
              <div>Pôvodná suma: {preview.originalAmount} €</div>
              <div style={{ color: "green" }}>
                Zľava: -{preview.discount} €
              </div>
              <div style={{ fontWeight: "bold" }}>
                Na zaplatenie: {preview.finalAmount} €
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              Na zaplatenie: {result.totalAmount ?? 0} €
            </div>
          )}

          {result.seats && result.seats.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <b>Miesta:</b>
              <ul>
                {result.seats.map((seat) => (
                  <li key={seat.id}>
                    {seat.typMiesta === "ROW_SEAT"
                      ? `Rad ${seat.rad} – Miesto ${seat.cislo}`
                      : `Stôl ${seat.stol} – Stolička ${seat.stolicka}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.status === "RESERVED_UNPAID" && result.orderId && (
            <div style={{ marginTop: 15 }}>
              <input
                placeholder="Darčekový kód"
                value={giftCode}
                onChange={(e) => {
                  const value = e.target.value
                  setGiftCode(value)

                  if (result?.type === "ORDER" && result.orderId) {
                    void previewGift(result.orderId, value)
                  }
                }}
                className="formInput"
              />

              <div style={{ marginTop: 10 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={sendReceipt}
                    onChange={(e) => setSendReceipt(e.target.checked)}
                  />
                  {" "}Poslať potvrdenie emailom
                </label>
              </div>

              {sendReceipt && (
                <div style={{ marginTop: 10 }}>
                  <input
                    placeholder="Email zákazníka"
                    value={receiptEmail}
                    onChange={(e) => setReceiptEmail(e.target.value)}
                    className="formInput"
                  />
                </div>
              )}

              <button
                className="primaryBtn"
                style={{ marginTop: 15 }}
                onClick={() => void payOrder(result.orderId!)}
                disabled={payingOrder}
              >
                {payingOrder ? "Spracováva sa..." : "Označiť ako zaplatené"}
              </button>
            </div>
          )}

          {result.status === "PAID" && result.orderId && (
            <button
              style={{ marginTop: 15 }}
              onClick={() => void checkinOrder(result.orderId!)}
              disabled={checkingInOrder}
            >
              {checkingInOrder ? "Spracováva sa..." : "Povoliť vstup skupine"}
            </button>
          )}

          {result.status === "USED" && (
            <div style={{ marginTop: 15, color: "red" }}>
              Táto objednávka už bola použitá.
            </div>
          )}
        </div>
      )}

      {/* LEGEND */}
      <div style={{ marginTop: 40 }}>
        <h2 className="headingSecondary" style={{ marginBottom: 20 }}>
          Mapa sály ({hallName})
        </h2>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 18,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            marginBottom: 20
          }}
        >
          <h3 className="headingTertiary" style={{ marginTop: 0 }}>
            Legenda
          </h3>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 26, background: "#27A7B2", borderRadius: "6px 6px 12px 12px" }} />
              Voľné
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 26, background: "#d4a017", borderRadius: "6px 6px 12px 12px" }} />
              Checknuté
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 26, background: "#1E4D4F", opacity: 0.35, borderRadius: "6px 6px 12px 12px" }} />
              Predané
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 26, border: "3px solid gold", borderRadius: "6px 6px 12px 12px" }} />
              Naskenované miesto
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 22, background: "#27A7B2", borderRadius: "50%" }} />
              Detské miesto
            </div>
          </div>
        </div>

        {/* PODIUM */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              textAlign: "center",
              padding: "12px 0",
              borderRadius: 12,
              background: "rgba(30,77,79,0.08)",
              color: "var(--primary)",
              fontWeight: 700
            }}
          >
            Pódium
          </div>
        </div>

        {/* SEATS */}
        <div
          style={{
            
            
            padding: 18,
            
            overflowX: "auto"
          }}
        >
          <div style={{ minWidth: 1000 }}>
            {(() => {
              // 2) Table layout detection
              const isTableLayout = seats.some((s) => s.typMiesta === "TABLE_SEAT")

              // 3) Conditional rendering
              // CHILD_SEAT layout detection
              const isKidsLayout = seats.some((s) => s.typMiesta === "CHILD_SEAT")

              return isTableLayout ? (
                (() => {
                  const tables = Object.values(groupedSeats)

                  const rows = [
                    [1, null, 2, 3, null, 4, 5],
                    [6, null, 7, 8, null, 9, 10],
                    [11, null, 12, 13, null, 14, 15],
                    [null, null, null, 16, 17, null, 18, 19]
                  ]

                  return rows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        gap: 28,
                        marginBottom: 28
                      }}
                    >
                      {row.map((tableNumber, colIndex) => {
                        if (!tableNumber) {
                          return <div key={`spacer-${rowIndex}-${colIndex}`} style={{ width: 44 }} />
                        }

                        const tableSeats = tables.find(
                          (t) => t[0]?.stol === tableNumber
                        )

                        if (!tableSeats) return null

                        return (
                          <div key={tableNumber}>
                            <div
                              style={{
                                position: "relative",
                                width: 110,
                                height: 110,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  width: 70,
                                  height: 70,
                                  background: "#e5e5e5",
                                  transform: "rotate(45deg)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                              >
                                <div style={{ transform: "rotate(-45deg)", fontWeight: 600 }}>
                                  stôl {tableNumber}
                                </div>
                              </div>

                              {tableSeats.map((seat) => {
                                const pos = seat.stolicka || 0

                                let style: React.CSSProperties = { position: "absolute" }

                                if (pos === 1) style = { ...style, top: -6, left: "50%", transform: "translateX(-50%)" }
                                if (pos === 2) style = { ...style, right: -6, top: "50%", transform: "translateY(-50%)" }
                                if (pos === 3) style = { ...style, bottom: -6, left: "50%", transform: "translateX(-50%)" }
                                if (pos === 4) style = { ...style, left: -6, top: "50%", transform: "translateY(-50%)" }

                                return (
                                  <div key={seat.id} style={style}>
                                    {renderSeat(seat)}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                })()
              ) : isKidsLayout ? (
                (() => {
                  const seatByNumber: Record<number, Seat> = {}
                  seats.forEach((s) => {
                    if (s.cislo != null) seatByNumber[s.cislo] = s
                  })

                  const col1 = [2, 4, 6, 8, 10, 11, 12, 13]
                  const col2 = [1, 3, 5, 7, 9]
                  const col3 = [14, 16, 18, 20, 22]
                  const col4 = [15, 17, 19, 21, 23, 24, 25, 26]

                  return (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        gap: 60,
                        marginBottom: 40
                      }}
                    >
                      {/* LEFT BLOCK */}
                      <div style={{ display: "flex", gap: 24 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {col1.map((n) => {
                            const s = seatByNumber[n]
                            return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                          })}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {col2.map((n) => {
                            const s = seatByNumber[n]
                            return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                          })}

                          <div style={{ height: 180 }} />

                          {[27, 28].map((n) => {
                            const s = seatByNumber[n]
                            return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                          })}
                        </div>
                      </div>

                      <div style={{ width: 180 }} />

                      {/* RIGHT BLOCK */}
                      <div style={{ display: "flex", gap: 24 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {col3.map((n) => {
                            const s = seatByNumber[n]
                            return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                          })}

                          <div style={{ height: 180 }} />

                          {[29, 30].map((n) => {
                            const s = seatByNumber[n]
                            return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                          })}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {col4.map((n) => {
                            const s = seatByNumber[n]
                            return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                Object.keys(groupedSeats).map((key) => {
                  const rowSeats = [...groupedSeats[key]].sort((a, b) => {
                    const aNum = a.cislo || a.stolicka || 0
                    const bNum = b.cislo || b.stolicka || 0
                    return aNum - bNum
                  })

                  return (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                        <div style={{ width: 30, fontWeight: 700, color: "var(--primary)" }}>
                          {key.replace("row-", "").replace("table-", "")}
                        </div>
                        {(() => {
                          const rowNumber = rowSeats[0]?.rad
                          const isSpecial = [14, 15, 16].includes(rowNumber || 0)

                          if (isSpecial) {
                            const leftSeats = rowSeats.filter((s) => (s.cislo || 0) >= 11)
                            const middleSeats = rowSeats.filter((s) => (s.cislo || 0) >= 3 && (s.cislo || 0) <= 10)
                            const rightSeats = rowSeats.filter((s) => (s.cislo || 0) <= 2)

                            const gap = 110

                            return (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                <div style={{ display: "flex", flexWrap: "nowrap" }}>{leftSeats.map(renderSeat)}</div>
                                <div style={{ width: gap }} />
                                <div style={{ display: "flex", flexWrap: "nowrap" }}>{middleSeats.map(renderSeat)}</div>
                                <div style={{ width: gap }} />
                                <div style={{ display: "flex", flexWrap: "nowrap" }}>{rightSeats.map(renderSeat)}</div>
                              </div>
                            )
                          }

                          return (
                            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                              <div style={{ display: "flex", justifyContent: "center", flexWrap: "nowrap" }}>
                                {rowSeats.map(renderSeat)}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}