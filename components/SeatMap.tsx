"use client"

import { useEffect, useState, CSSProperties } from "react"
import { HallSeat } from "@prisma/client"

type ReservedResponse = {
  myReservedSeatIds: number[]
  reservedByOthersSeatIds: number[]
  soldSeatIds: number[]
}

export default function SeatMap({
  seats,
  terminId,
  reservedSeats
}: {
  seats: HallSeat[]
  terminId: number
  reservedSeats: number[]
}) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [myReservedSeats, setMyReservedSeats] = useState<number[]>([])
  const [reservedByOthersSeats, setReservedByOthersSeats] = useState<number[]>([])
  const [soldSeats, setSoldSeats] = useState<number[]>(reservedSeats)
  const [loadingSeatIds, setLoadingSeatIds] = useState<number[]>([])
  const [isFetching, setIsFetching] = useState(false)

  const MAX_SEATS = 6
  const [message, setMessage] = useState<string | null>(null)

  const maxReached = selectedSeats.length === MAX_SEATS

  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return ""

    let existing = localStorage.getItem("sessionId")

    if (!existing) {
      existing = crypto.randomUUID()
      localStorage.setItem("sessionId", existing)
    }

    return existing
  })

  const isRowLayout = seats.some((s) => s.typMiesta === "ROW_SEAT")
  const isKidsLayout = seats.some((s) => s.typMiesta === "CHILD_SEAT")

  async function loadReservedSeats() {
    if (isFetching) return

    setIsFetching(true)

    try {
      const res = await fetch(
        `/api/terminy/${terminId}/reserved?sessionId=${sessionId}`
      )

      if (!res.ok) return

      const data: ReservedResponse = await res.json()

      setMyReservedSeats(data.myReservedSeatIds)
      setReservedByOthersSeats(data.reservedByOthersSeatIds)
      setSoldSeats(data.soldSeatIds)
      setSelectedSeats(data.myReservedSeatIds)
    } catch {
      // ignoruj dev network chyby
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    void loadReservedSeats()

    const interval = setInterval(() => {
      void loadReservedSeats()
    }, 2000)

    return () => clearInterval(interval)
  }, [terminId, sessionId])

  async function reserveSeat(seatId: number) {
    if (selectedSeats.length >= MAX_SEATS) {
      setMessage(`Maximálny počet miest je ${MAX_SEATS}`)
      setTimeout(() => setMessage(null), 2500)
      return
    }

    setLoadingSeatIds((prev) => [...prev, seatId])

    try {
      const res = await fetch("/api/rezervacia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          terminId,
          hallSeatId: seatId,
          sessionId
        })
      })

      if (!res.ok) {
        const data = await res.json()
        setMessage(data.error || "Rezervácia zlyhala")
        setTimeout(() => setMessage(null), 2500)
      }

      await loadReservedSeats()
    } catch {
      setMessage("Server vrátil chybu")
      setTimeout(() => setMessage(null), 2500)
    } finally {
      setLoadingSeatIds((prev) => prev.filter((id) => id !== seatId))
    }
  }

  async function releaseSeat(seatId: number) {
    setLoadingSeatIds((prev) => [...prev, seatId])

    try {
      const res = await fetch("/api/rezervacia", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          terminId,
          hallSeatId: seatId,
          sessionId
        })
      })

      if (!res.ok) {
        const data = await res.json()
        setMessage(data.error || "Zrušenie rezervácie zlyhalo")
        setTimeout(() => setMessage(null), 2500)
      }

      await loadReservedSeats()
    } catch {
      setMessage("Server vrátil chybu")
      setTimeout(() => setMessage(null), 2500)
    } finally {
      setLoadingSeatIds((prev) => prev.filter((id) => id !== seatId))
    }
  }

  async function toggleSeat(seatId: number) {
    const isMine = myReservedSeats.includes(seatId)
    const isReservedByOthers = reservedByOthersSeats.includes(seatId)
    const isSold = soldSeats.includes(seatId)
    const isLoading = loadingSeatIds.includes(seatId)

    if (isLoading) return
    if (isReservedByOthers || isSold) return

    if (isMine) {
      await releaseSeat(seatId)
      return
    }

    await reserveSeat(seatId)
  }

  function renderSeat(seat: HallSeat) {
    const isMine = myReservedSeats.includes(seat.id)
    const isReservedByOthers = reservedByOthersSeats.includes(seat.id)
    const isSold = soldSeats.includes(seat.id)
    const isLoading = loadingSeatIds.includes(seat.id)

    let color = "#27A7B2"
    let seatOpacity = 1

    if (isMine) color = "#d4a017"
    if (isReservedByOthers) color = "#4E8083"
    if (isSold) {
      color = "#1E4D4F"
      seatOpacity = 0.35
    }

    return (
      <div
        key={seat.id}
        className="seatItem"
        onClick={() => void toggleSeat(seat.id)}
        style={{
          width: "40px",
          height: "44px",
          margin: "6px",
          backgroundColor: color,
          cursor:
            isReservedByOthers || isSold || isLoading
              ? "not-allowed"
              : "pointer",
          opacity: isLoading ? 0.6 : seatOpacity,
          borderRadius: seat.typMiesta === "CHILD_SEAT"
            ? "50%"
            : "6px 6px 14px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          transform: (() => {
            if (!isKidsLayout || seat.typMiesta === "CHILD_SEAT") return "none"

            const num = seat.cislo || 0

            // special seats facing up
            if ([21, 28, 29, 30].includes(num)) return "rotate(0deg)"

            // left side (first column) → faces right
            if (num >= 2 && num <= 13) return "rotate(90deg)"

            // right side → faces left
            if (num >= 14 && num <= 26) return "rotate(-90deg)"

            return "none"
          })(),
          // writingMode line removed as per instructions
        }}
      >
        {seat.cislo ?? seat.stolicka ?? ""}
      </div>
    )
  }

  const groupedSeats: Record<string, HallSeat[]> = {}

  if (isRowLayout) {
    seats.forEach((seat) => {
      const key = `row-${seat.rad}`

      if (!groupedSeats[key]) groupedSeats[key] = []

      groupedSeats[key].push(seat)
    })
  } else {
    seats.forEach((seat) => {
      const key = `table-${seat.stol}`

      if (!groupedSeats[key]) groupedSeats[key] = []

      groupedSeats[key].push(seat)
    })
  }

  return (
    <div>
      <h2 className="headingSecondary" style={{ marginBottom: 20 }}>Vyberte miesta</h2>

      {message && (
        <div style={{
          marginBottom: 16,
          padding: "10px 14px",
          background: "#ffe5e5",
          borderRadius: 8,
          color: "#b71c1c"
        }}>
          {message}
        </div>
      )}

      {maxReached && (
        <div style={{
          marginBottom: 16,
          padding: "10px 14px",
          background: "#fff4e0",
          borderRadius: 8,
          color: "#8a5a00"
        }}>
          Už ste dosiahli maximálny počet miest ({MAX_SEATS}).
        </div>
      )}

      <div
        className="seatmap-responsive-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1fr)",
          gap: 20,
          marginBottom: 28,
          alignItems: "start"
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 18,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
          }}
        >
          <h3 className="headingTertiary" style={{ marginTop: 0, marginBottom: 12 }}>
            Legenda
          </h3>

          <div className="legendGrid">
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
            {isKidsLayout && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 22, height: 22, background: "#27A7B2", borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
                Miesta pre deti (do 5 rokov)
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 18,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 className="headingTertiary" style={{ margin: 0 }}>
              Vybrané miesta
            </h3>
            <div style={{ color: "#777", fontSize: 14 }}>
              {selectedSeats.length} / {MAX_SEATS}
            </div>
          </div>

          <div
            style={{
              color: "#555",
              lineHeight: 1.6,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 20px"
            }}
          >
            {selectedSeats.length === 0
              ? "Zatiaľ nemáte vybraté žiadne miesta."
              : selectedSeats
                  .map((seatId) => {
                    const seat = seats.find((s) => s.id === seatId)
                    if (!seat) return null

                    if (seat.rad && seat.cislo) {
                      return (
                        <div key={seatId}>
                          Rad {seat.rad}, miesto {seat.cislo}
                        </div>
                      )
                    }

                    if (seat.stol && seat.stolicka) {
                      return (
                        <div key={seatId}>
                          Stôl {seat.stol}, stolička {seat.stolicka}
                        </div>
                      )
                    }

                    return <div key={seatId}>Miesto {seatId}</div>
                  })}
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: 24,
          width: "100%"
        }}
      >
        <div
          style={{
            width: "100%",
            textAlign: "center",
            padding: "12px 0",
            borderRadius: 12,
            background: "rgba(30,77,79,0.08)",
            color: "var(--primary)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          Pódium
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          width: "100%",
          paddingLeft: "20px",
          paddingRight: "20px"
        }}
      >
        <div style={{
          minWidth: "884px",
          WebkitOverflowScrolling: "touch",
          margin: "0 auto",
          paddingLeft: "80px",
          paddingRight: "80px",
          paddingTop: "20px",
          boxSizing: "content-box"
        }}>
          {isKidsLayout ? (
            (() => {
              const getSeat = (num: number) => seats.find(s => s.cislo === num)

              const leftMain = [2,4,6,8,10,11,12,13]
              const leftChild = [1,3,5,7,9]

              const rightChildCol = [14,16,18,20,22]
              const rightMain = [15,17,19,21,23,24,25,26]

              return (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 120 }}>

                  {/* LEFT SIDE */}
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {leftMain.map(n => getSeat(n)).filter((s): s is HallSeat => Boolean(s)).map(renderSeat)}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
                      {leftChild.map(n => getSeat(n)).filter((s): s is HallSeat => Boolean(s)).map(renderSeat)}

                      <div style={{ height: 120 }} />

                      {[27,28].map(n => getSeat(n)).filter((s): s is HallSeat => Boolean(s)).map(renderSeat)}
                    </div>
                  </div>

                  {/* CENTER GAP */}
                  <div style={{ width: 120 }} />

                  {/* RIGHT SIDE */}
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
                      {rightChildCol.map(n => getSeat(n)).filter((s): s is HallSeat => Boolean(s)).map(renderSeat)}

                      <div style={{ height: 120 }} />

                      {[29,30].map(n => getSeat(n)).filter((s): s is HallSeat => Boolean(s)).map(renderSeat)}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {rightMain.map(n => getSeat(n)).filter((s): s is HallSeat => Boolean(s)).map(renderSeat)}
                    </div>
                  </div>

                </div>
              )
            })()
          ) : isRowLayout ? (
            Object.keys(groupedSeats).map((key) => {
              const rowSeats = [...groupedSeats[key]].sort((a, b) => {
                const aNum = isRowLayout ? (a.cislo || 0) : (a.stolicka || 0)
                const bNum = isRowLayout ? (b.cislo || 0) : (b.stolicka || 0)
                return bNum - aNum
              })
              // ROW layout (existing logic)
              return (
                <div
                  key={key}
                  className="rowWrapper"
                  style={{
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 14,
                    width: "100%",
                    position: "relative"
                  }}
                >
                  <div
                    className="rowLabel"
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "var(--primary)",
                      position: "sticky",
                      left: 0,
                      top: 0,
                      zIndex: 10,
                      pointerEvents: "none"
                    }}
                  >
                    {isRowLayout
                      ? `${rowSeats[0].rad}.`
                      : `${rowSeats[0].stol}`}
                  </div>

                  <div style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    width: "100%"
                  }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center"
                      }}
                    >
                      {(() => {
                        const isSpecial = [14, 15, 16].includes(rowSeats[0].rad || 0)
                        return (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {/* Special row layout for rows 14, 15, 16 */}
                            {isSpecial ? (() => {
                              // Partition seats into left, middle, right groups
                              const leftSeats = rowSeats.filter(s => (s.cislo || 0) >= 11)
                              const middleSeats = rowSeats.filter(s => (s.cislo || 0) >= 3 && (s.cislo || 0) <= 10)
                              const rightSeats = rowSeats.filter(s => (s.cislo || 0) <= 2)
                              return (
                                <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
                                  {/* LEFT (11,12) */}
                                  <div style={{ display: "flex" }}>
                                    {leftSeats.map(renderSeat)}
                                  </div>

                                  {/* MEDZERA - nastavíš si podľa potreby */}
                                  <div style={{ width: 130 }} />

                                  {/* CENTER (3–10) */}
                                  <div style={{ display: "flex", margin: "0 auto" }}>
                                    {middleSeats.map(renderSeat)}
                                  </div>

                                  {/* MEDZERA - nastavíš si podľa potreby */}
                                  <div style={{ width: 130 }} />

                                  {/* RIGHT (1,2) */}
                                  <div style={{ display: "flex" }}>
                                    {rightSeats.map(renderSeat)}
                                  </div>
                                </div>
                              )
                            })() : (
                              rowSeats.map((seat, index, arr) => {
                                const elements = [renderSeat(seat)]
                                const isSpecialRow = [14, 15, 16].includes(seat.rad || 0)
                                const next = arr[index + 1]

                                if (
                                  isSpecialRow &&
                                  next &&
                                  ((seat.cislo === 12 && next.cislo === 10) ||
                                    (seat.cislo === 3 && next.cislo === 2))
                                ) {
                                  elements.push(
                                    <div key={`gap-${seat.id}`} style={{ width: 48 }} />
                                  )
                                }

                                return elements
                              })
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            // TABLES grouped row layout
            (() => {
              const tables = Object.values(groupedSeats)

              const rows = [
                [1, 2, 3, 4, 5],
                [6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15],
                [16, 17, 18, 19]
              ]

              return rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="tableRow seatmapFixed"
                  style={{
                    justifyContent: "center"
                  }}
                >
                  {(() => {
                    const isLastRow = rowIndex === 3
                    const missingLeftSlots = isLastRow ? 1 : 0
                    return (
                      <>
                        {Array.from({ length: missingLeftSlots }).map((_, i) => (
                          <div key={`empty-${i}`} className="tableCell" style={{ visibility: "hidden" }}>
                            <div style={{ width: 140, height: 140 }} />
                          </div>
                        ))}
                      </>
                    )
                  })()}
                  {row.map((tableNumber, index) => {
                    const tableSeats = tables.find(
                      (t) => t[0]?.stol === tableNumber
                    )

                    if (!tableSeats) return null

                    return (
                      <div key={tableNumber} className="tableCell">
                        <div
                          style={{
                            position: "relative",
                            width: 140,
                            height: 140,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              width: 90,
                              height: 90,
                              background: "#e5e5e5",
                              transform: "rotate(45deg)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <div
                              style={{
                                transform: "rotate(-45deg)",
                                textAlign: "center",
                                fontWeight: 600
                              }}
                            >
                              stôl<br />{tableNumber}
                            </div>
                          </div>

                          {tableSeats.map((seat) => {
                            const pos = seat.stolicka || 0

                            let style: CSSProperties = {
                              position: "absolute"
                            }

                            if (pos === 1) style = { ...style, top: -10, left: "50%", transform: "translateX(-50%)" }
                            if (pos === 2) style = { ...style, right: -10, top: "50%", transform: "translateY(-50%)" }
                            if (pos === 3) style = { ...style, bottom: -10, left: "50%", transform: "translateX(-50%)" }
                            if (pos === 4) style = { ...style, left: -10, top: "50%", transform: "translateY(-50%)" }

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
          )}
        </div>
      </div>


      <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
        <a
          href={
            selectedSeats.length > 0
              ? `/terminy/${terminId}/checkout?sessionId=${sessionId}`
              : "#"
          }
          className="primaryBtn"
          style={{
            textDecoration: "none",
            opacity: selectedSeats.length === 0 ? 0.5 : 1,
            pointerEvents: selectedSeats.length === 0 ? "none" : "auto"
          }}
        >
          Pokračovať na checkout
        </a>
      </div>

      <style jsx>{`
        .legendGrid {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .tableRow {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 60px;
          margin-bottom: 50px;
        }

        .tableCell {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 0 0 auto;
        }

        .tableRow > .tableCell:nth-child(1) {
          margin-right: 60px;
        }

        .tableRow > .tableCell:nth-child(3) {
          margin-right: 60px;
        }

        @media (max-width: 900px) {
          .seatmap-responsive-grid {
            grid-template-columns: 1fr !important;
          }

          .seatmap-responsive-grid > div {
            width: 100% !important;
          }
        }

        @media (max-width: 600px) {
          .rowWrapper {
            grid-template-columns: 40px 1fr !important;
            gap: 6px !important;
          }

          .rowLabel { 
            padding-right: 4px !important;
            padding-left: 0 !important;
            background: transparent !important;
            font-size: 18px !important;
            text-align: left !important;
          }
          .legendGrid {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 10px 16px;
          }
          .seatItem {
            width: 24px !important;
            height: 28px !important;
            font-size: 8px !important;
            margin: 2px !important;
          }
          .tableRow {
            gap: 30px;
            flex-wrap: nowrap;
          }
          .seatmapFixed {
            transform: scale(0.8);
            transform-origin: top center;
          }
        }
      `}</style>
    </div>
  )
}