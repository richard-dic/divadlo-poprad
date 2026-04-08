"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { subscribe } from "@/lib/seatEvents"

type Seat = {
  id: number
  rad: number | null
  cislo: number | null
  stol: number | null
  stolicka: number | null
  typMiesta: string
  status: "FREE" | "SOLD" | "CHECKED"
}

type ReservedResponse = {
  myReservedSeatIds: number[]
  reservedByOthersSeatIds: number[]
  soldSeatIds: number[]
}

export default function SellerSeatMap({
  terminId,
  mode
}: {
  terminId: number
  mode: "internal" | "external"
}) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [others, setOthers] = useState<number[]>([])
  const [sold, setSold] = useState<number[]>([])

  const [hallName, setHallName] = useState("")
  const [seatPrice, setSeatPrice] = useState(0)

  const [giftCode, setGiftCode] = useState("")
  const [giftValue, setGiftValue] = useState(0)
  const [giftValid, setGiftValid] = useState(false)

  const [sendEmail, setSendEmail] = useState(false)
  const [email, setEmail] = useState("")

  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return ""

    let existing = localStorage.getItem("sellerSessionId")

    if (!existing) {
      existing = crypto.randomUUID()
      localStorage.setItem("sellerSessionId", existing)
    }

    return existing
  })

  async function loadSeats() {
    const res = await fetch("/api/scan/hall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ terminId })
    })

    if (!res.ok) return

    const data = await res.json()

    setSeats(data.seats)
    setHallName(data.hallName)
    setSeatPrice(data.seatPrice)

    const r = await fetch(
      `/api/terminy/${terminId}/reserved?sessionId=${sessionId}`
    )

    if (!r.ok) return

    const reserved: ReservedResponse = await r.json()

    setSelected(reserved.myReservedSeatIds)
    setOthers(reserved.reservedByOthersSeatIds)
    setSold(reserved.soldSeatIds)
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
  }, [terminId, sessionId])

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (
        event.type === "ORDER_UPDATED" ||
        event.type === "ORDER_CANCELLED" ||
        event.type === "ORDER_PAID" ||
        event.type === "CHECKED_IN"
      ) {
        void loadSeats()
      }
    })

    return unsubscribe
  }, [terminId, sessionId])

  useEffect(() => {
    const interval = setInterval(() => {
      void loadSeats()
    }, 2000)

    return () => clearInterval(interval)
  }, [terminId, sessionId])

  useEffect(() => {
    if (mode === "external") {
      return
    }

    const timer = setTimeout(async () => {
      if (!giftCode || giftCode.length < 5) {
        setGiftValid(false)
        setGiftValue(0)
        return
      }

      const res = await fetch("/api/giftcard/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: giftCode })
      })

      if (!res.ok) {
        setGiftValid(false)
        setGiftValue(0)
        return
      }

      const data = await res.json()

      if (data.valid) {
        setGiftValid(true)
        setGiftValue(data.remainingAmount)
      } else {
        setGiftValid(false)
        setGiftValue(0)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [giftCode, mode])

  async function toggleSeat(seat: Seat) {
  if (seat.status === "SOLD") return
  if (others.includes(seat.id)) return
  if (sold.includes(seat.id)) return

  const isMine = selected.includes(seat.id)

  // 🔥 OPTIMISTIC UPDATE
  if (isMine) {
    setSelected((prev) => prev.filter((id) => id !== seat.id))
  } else {
    setSelected((prev) => [...prev, seat.id])
  }

  try {
    await fetch("/api/admin/rezervacia", {
      method: isMine ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        terminId,
        hallSeatId: seat.id,
        sessionId
      })
    })
  } catch {
    // rollback ak by failol request
    if (isMine) {
      setSelected((prev) => [...prev, seat.id])
    } else {
      setSelected((prev) => prev.filter((id) => id !== seat.id))
    }

    alert("Chyba komunikácie so serverom")
  }

  // refresh pre sync s ostatnými usermi
  await loadSeats()
}

  async function sell() {
    if (selected.length === 0) return

    const trimmedEmail = email.trim()

    if (mode === "external" && !trimmedEmail) {
      alert("Pri externom predaji je potrebné zadať email.")
      return
    }

    if (mode !== "external" && sendEmail && !trimmedEmail) {
      alert("Zadaj email zákazníka.")
      return
    }

    const res = await fetch("/api/seller/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        terminId,
        seatIds: selected,
        sessionId,
        email: trimmedEmail || null,
        sendEmail: mode === "external" ? true : sendEmail,
        giftCode: mode === "external" ? null : giftCode || null
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba")
      return
    }

    alert(
      `Predané\nZľava: ${data.discount || 0} €\nSuma: ${data.finalAmount} €`
    )

    setEmail("")
    setSendEmail(mode === "external")
    setGiftCode("")
    setGiftValue(0)
    setGiftValid(false)

    await loadSeats()
  }

  function renderSeat(seat: Seat) {
    const isMine = selected.includes(seat.id)
    const isReservedByOthers = others.includes(seat.id)
    const isSold = sold.includes(seat.id)

    let color = "#27A7B2"
    let seatOpacity = 1

    if (isMine) color = "#d4a017"
    if (isReservedByOthers) color = "#4E8083"
    if (isSold) {
      color = "#1E4D4F"
      seatOpacity = 0.35
    }

    const isBlocked = isReservedByOthers || isSold

    // NEW: child seat/side logic
    const isKidsLayout = seats.some((s) => s.typMiesta === "CHILD_SEAT")
    const isChild = seat.typMiesta === "CHILD_SEAT"

    // define side based on cislo (kids layout numbers)
    const leftSideNumbers = [2,4,6,8,10,11,12,13,1,3,5,7,9,27,28]
    const rightSideNumbers = [14,16,18,20,22,29,30,15,17,19,21,23,24,25,26]

    const isLeft = seat.cislo ? leftSideNumbers.includes(seat.cislo) : false
    const isRight = seat.cislo ? rightSideNumbers.includes(seat.cislo) : false

    const isBottomSpecial = seat.cislo
      ? [27, 28, 29, 30].includes(seat.cislo)
      : false

    return (
      <div
        key={seat.id}
        onClick={() => {
          if (!isBlocked) {
            void toggleSeat(seat)
          }
        }}
        style={{
          width: "32px",
          height: "36px",
          margin: "4px",
          backgroundColor: color,
          cursor: isBlocked ? "not-allowed" : "pointer",
          opacity: seatOpacity,

          // 🔥 SHAPE
          borderRadius: isChild
            ? "50%"
            : isKidsLayout
            ? isBottomSpecial
              ? "6px 6px 14px 14px"
              : isLeft
              ? "14px 6px 6px 14px"
              : isRight
              ? "6px 14px 14px 6px"
              : "6px 6px 14px 14px"
            : "6px 6px 14px 14px",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "11px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
        }}
      >
        {seat.cislo ?? seat.stolicka ?? ""}
      </div>
    )
  }

  const groupedSeats: Record<string, Seat[]> = {}

  seats.forEach((seat) => {
    const key =
      seat.typMiesta === "TABLE_SEAT"
        ? `table-${seat.stol}`
        : `row-${seat.rad}`

    if (!groupedSeats[key]) groupedSeats[key] = []
    groupedSeats[key].push(seat)
  })

  const isRowLayout = seats.some((s) => s.typMiesta === "ROW_SEAT")
  const isKidsLayout = seats.some((s) => s.typMiesta === "CHILD_SEAT")

  const baseTotal = selected.length * seatPrice
  const discount = mode === "external" ? 0 : Math.min(giftValue, baseTotal)
  const finalTotal = baseTotal - discount

  return (
  <div className="adminContainer" style={{ marginTop: 30 }}>
    <div className="seatmapWrapper" style={{ maxWidth: 1100, margin: "0 auto" }}>


      {/* LEGEND + SELECTED */}
      <div className="legendGrid">
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: 18,
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
        }}>
          <h3 className="headingTertiary" style={{ marginBottom: 12, marginTop: 0 }}>Legenda</h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 26, background: "#27A7B2", borderRadius: "4px 4px 10px 10px", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
              Voľné
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 26, background: "#d4a017", borderRadius: "4px 4px 10px 10px", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
              Vybrané
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 26, background: "#4E8083", borderRadius: "4px 4px 10px 10px", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
              Rezervované
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 26, background: "#1E4D4F", opacity: 0.35, borderRadius: "4px 4px 10px 10px", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
              Predané
            </div>
            {/* CHILD SEAT LEGEND */}
            {isKidsLayout && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 22, height: 22, background: "#27A7B2", borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
                Miesta pre deti (do 5 rokov)
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: 18,
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
        }}>
          <h3 className="headingTertiary" style={{ marginBottom: 12, marginTop: 0 }}>Vybrané miesta</h3>

          {selected.length === 0 ? (
            "Žiadne miesta"
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 20px"
            }}>
              {selected.map((id) => {
                const s = seats.find(se => se.id === id)
                if (!s) return null

                if (s.rad && s.cislo) {
                  return <div key={id}>Rad {s.rad}, miesto {s.cislo}</div>
                }

                if (s.stol && s.stolicka) {
                  return <div key={id}>Stôl {s.stol}, stolička {s.stolicka}</div>
                }

                return <div key={id}>Miesto {id}</div>
              })}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* PODIUM */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          textAlign: "center",
          padding: "12px 0",
          borderRadius: 12,
          background: "rgba(30,77,79,0.08)",
          color: "var(--primary)",
          fontWeight: 700
        }}>
          Pódium
        </div>
      </div>

      {/* SEATMAP */}
      <div style={{ position: "relative", padding: "0", overflow: "hidden" }}>
        <div style={{ display: "block" }}>
          {/* Overlay row labels */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 40,
              pointerEvents: "none",
              zIndex: 2
            }}
          >
            {isRowLayout &&
              Object.keys(groupedSeats).map((key) => {
                const rowSeats = [...groupedSeats[key]].sort((a, b) => {
                  const aNum = a.cislo || 0
                  const bNum = b.cislo || 0
                  return bNum - aNum
                })

                return (
                  <div
                    key={`label-${key}`}
                    style={{
                      height: 44,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      fontSize: 20,
                      fontWeight: 800,
                      color: "var(--primary)",
                      paddingLeft: 0,
                      background: "transparent"
                    }}
                  >
                    {rowSeats[0]?.rad}.
                  </div>
                )
              })}
          </div>
          <div className="seatmapScroll" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                minWidth: isRowLayout ? "1100px" : "auto",
                marginLeft: "260px",
                marginRight: "180px",
                padding: "20px 0",
              }}
            >
          {isRowLayout ? (
            Object.keys(groupedSeats).map((key) => {
              const rowSeats = [...groupedSeats[key]].sort((a, b) => {
                const aNum = a.cislo || 0
                const bNum = b.cislo || 0
                return bNum - aNum
              })

              return (
                <div
                  key={key}
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    {(() => {
                      const isSpecial = [14, 15, 16].includes(rowSeats[0]?.rad || 0)

                      if (isSpecial) {
                        // spacing between seat groups (rows 14–16) → adjust this value
                        const specialRowGap = 98
                        const leftSeats = rowSeats.filter((s) => (s.cislo || 0) >= 11)
                        const middleSeats = rowSeats.filter(
                          (s) => (s.cislo || 0) >= 3 && (s.cislo || 0) <= 10
                        )
                        const rightSeats = rowSeats.filter((s) => (s.cislo || 0) <= 2)

                        return (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              {leftSeats.map(renderSeat)}
                            </div>

                            <div style={{ width: specialRowGap, flex: `0 0 ${specialRowGap}px` }} />

                            <div style={{ display: "flex" }}>
                              {middleSeats.map(renderSeat)}
                            </div>

                            <div style={{ width: specialRowGap, flex: `0 0 ${specialRowGap}px` }} />

                            <div style={{ display: "flex" }}>
                              {rightSeats.map(renderSeat)}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div style={{ display: "flex" }}>
                          {rowSeats.map(renderSeat)}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )
            })
          ) : isKidsLayout ? (
            (() => {
              // map seats by cislo for easy lookup
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
                    {/* COLUMN 1 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {col1.map((n) => {
                        const s = seatByNumber[n]
                        return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                      })}
                    </div>

                    {/* COLUMN 2 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {col2.map((n) => {
                        const s = seatByNumber[n]
                        return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                      })}

                      {/* vertical gap like column height */}
                      <div style={{ height: 120 }} />

                      {/* 27 + 28 */}
                      {[27, 28].map((n) => {
                        const s = seatByNumber[n]
                        return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                      })}
                    </div>
                  </div>

                  {/* CENTER GAP */}
                  <div style={{ width: 180 }} />

                  {/* RIGHT BLOCK */}
                  <div style={{ display: "flex", gap: 24 }}>
                    {/* COLUMN 3 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {col3.map((n) => {
                        const s = seatByNumber[n]
                        return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                      })}

                      <div style={{ height: 120 }} />

                      {[29, 30].map((n) => {
                        const s = seatByNumber[n]
                        return s ? renderSeat(s) : <div key={n} style={{ height: 44 }} />
                      })}
                    </div>

                    {/* COLUMN 4 */}
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
                  className={rowIndex === rows.length - 1 ? "lastRow" : ""}
                  style={{
                    display: "flex",
                    justifyContent: rowIndex === rows.length - 1 ? "flex-end" : "center",
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

                            // Use imported CSSProperties type
                            const styleFinal: CSSProperties = style

                            return (
                              <div key={seat.id} style={styleFinal}>
                                <div style={{ position: "relative" }}>
                                  {renderSeat(seat)}
                                  
                                </div>
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
          )}
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div style={{
        background: "#fff",
        padding: 24,
        borderRadius: 12,
        border: "1px solid #eee",
        marginTop: 30
      }}>

        {/* EMAIL SECTION */}
        {mode === "external" ? (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
              Email zákazníka (objednávka)
            </label>
            <input
              className="input"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                style={{ accentColor: "#27A7B2" }}
              />
              Poslať vstupenky na email
            </label>

            {sendEmail && (
              <div style={{ marginTop: 10 }}>
                <input
                  className="input"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {mode !== "external" && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
              Darčekový kód
            </label>
            <input
              className="input"
              placeholder="XXXX-XXXX-XX"
              value={giftCode}
              onChange={(e) => {
                let val = e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase()
                if (val.length > 4) val = val.slice(0,4) + "-" + val.slice(4)
                if (val.length > 9) val = val.slice(0,9) + "-" + val.slice(9)
                if (val.length > 12) val = val.slice(0,12)
                setGiftCode(val)
              }}
            />

            {!giftValid && giftCode.length > 4 && (
              <div style={{ color: "red", marginTop: 6 }}>
                Neplatný kód
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>Počet</span>
          <span>{selected.length}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>Cena za miesto</span>
          <span>{seatPrice} €</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span>Spolu</span>
          <span>{baseTotal} €</span>
        </div>

        {mode !== "external" && giftValid && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            color: "var(--primary)",
            fontWeight: 500
          }}>
            <span>Uplatnené z poukážky</span>
            <span>-{discount} €</span>
          </div>
        )}

        <div style={{
          borderTop: "1px solid #eee",
          margin: "12px 0"
        }} />

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
          fontWeight: 700
        }}>
          <span>K úhrade</span>
          <span>{finalTotal} €</span>
        </div>
      </div>

      {/* FORM */}

      <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
        <button className="primaryBtn" onClick={() => void sell()}>
          Predať ({selected.length})
        </button>
      </div>

    </div>
    <style jsx>{`
      .seatmapScroll {
        overflow-x: auto;
        overflow-y: hidden;
        width: 100%;
      }

      .legendGrid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 28px;
      }

      .lastRow {
        margin-left: 560px !important;
      }

      @media (max-width: 1024px) {
        .lastRow {
          margin-left: 520px !important;
        }
      }

      @media (max-width: 768px) {
        .legendGrid {
          grid-template-columns: 1fr;
        }
        .seatmapScroll > div {
          padding-left: 120px !important;
          padding-right: 40px !important;
        }
        .seatmapScroll {
          overflow-x: auto;
          padding-left: 0 !important;
        }
        .seatmapWrapper {
          max-width: 100% !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .lastRow {
          margin-left: 360px !important;
        }
      }
    `}</style>
  </div>
  )
}