"use client"

import { useEffect, useState } from "react"
import ScanClient from "@/app/(controller)/scan/[terminId]/ScanClient"
import SellerSeatMap from "@/components/SellerSeatMap"

type Termin = {
  id: number
  nazov: string
  datumCas: string
  hall: string
}

export default function ControllerDashboard() {
  const [mode, setMode] = useState<"scan" | "sell">("scan")
  const [termins, setTermins] = useState<Termin[]>([])
  const [terminId, setTerminId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/terminy/list")
      const data = await res.json()
      setTermins(data)
    }

    void load()
  }, [])

  return (
    <div className="adminContainer">
      <h1 className="headingPrimary" style={{ marginBottom: 24 }}>
        Kontrolór – Termíny
      </h1>

      {/* MODE SWITCH */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setMode("scan")}
          className={mode === "scan" ? "primaryBtn" : "secondaryBtn"}
        >
          Skenovanie
        </button>

        <button
          onClick={() => setMode("sell")}
          className={mode === "sell" ? "primaryBtn" : "secondaryBtn"}
        >
          Predaj
        </button>
      </div>

      {/* TERMIN LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {termins.map((t) => {
          const date = new Date(t.datumCas)

          return (
            <div
              key={t.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {t.nazov}
                </div>

                <div style={{ fontSize: 13, color: "#777" }}>
                  {date.toLocaleDateString("sk-SK")} {date.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
                  {" "}– {t.hall}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="secondaryBtn"
                  onClick={() => {
                    setMode("scan")
                    setTerminId(t.id)
                  }}
                >
                  Skenovať
                </button>

                <button
                  className="secondaryBtn"
                  onClick={() => {
                    setMode("sell")
                    setTerminId(t.id)
                  }}
                >
                  Predaj
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* CONTENT */}
      {terminId && (
        <div style={{ marginTop: 30 }}>
          {mode === "scan" && <ScanClient terminId={terminId} />}
          {mode === "sell" && (
            <SellerSeatMap terminId={terminId} mode="internal" />
          )}
        </div>
      )}
    </div>
  )
}