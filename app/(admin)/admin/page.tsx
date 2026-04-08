"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Stats = {
  revenueToday: number
  totalSeats: number
  soldSeats: number
  occupancy: number
  soldToday: number
}

type Termin = {
  id: number
  nazov: string
  datumCas: string
  sold: number
  capacity: number
  revenue?: number
}

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [terminy, setTerminy] = useState<Termin[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const res = await fetch("/api/admin/stats")

      if (!res.ok || cancelled) return

      const data = await res.json()

      if (cancelled) return

      setStats(data)

      const terminyRes = await fetch("/api/admin/terminy/overview")
      if (terminyRes.ok && !cancelled) {
        const tData = await terminyRes.json()
        setTerminy(tData)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  if (!stats) {
    return <div style={{ padding: 40 }}>Načítavam...</div>
  }

  const cardStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
  }

  const valueStyle = {
    fontSize: 26,
    fontWeight: 700,
    marginTop: 6
  }

  return (
    <div className="adminContainer">
      <h1 className="headingPrimary">Dashboard</h1>

      {/* STATS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 30
        }}
      >
        {/* REVENUE */}
        <div style={cardStyle}>
          <div className="headingTertiary">Dnešný obrat</div>
          <div style={valueStyle}>{stats.revenueToday ?? 0} €</div>
        </div>

        <div style={cardStyle}>
          <div className="headingTertiary">Predané dnes</div>
          <div style={valueStyle}>{stats.soldToday}</div>
        </div>

        {/* TOTAL */}
        <div style={cardStyle}>
          <div className="headingTertiary">Kapacita</div>
          <div style={valueStyle}>{stats.totalSeats}</div>
        </div>

        {/* SOLD */}
        <div style={cardStyle}>
          <div className="headingTertiary">Predané</div>
          <div style={valueStyle}>{stats.soldSeats}</div>
        </div>

        {/* OCCUPANCY */}
        <div style={cardStyle}>
          <div className="headingTertiary">Obsadenosť</div>
          <div style={valueStyle}>{stats.occupancy} %</div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ marginBottom: 30 }}>
        <div className="headingSecondary">Rýchle akcie</div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin/terminy" className="secondaryBtn">Termíny</Link>
          <Link href="/admin/orders" className="secondaryBtn">Objednávky</Link>
          <Link href="/admin/users" className="secondaryBtn">Používatelia</Link>
          <Link href="/admin/inscenacie" className="secondaryBtn">Inscenácie</Link>
        </div>
      </div>

      {/* SUMMARY */}
      <div>
        <div className="headingSecondary">Prehľad</div>

        <div style={{ ...cardStyle }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div><b>Kapacita spolu:</b> {stats.totalSeats}</div>
            <div><b>Predané lístky:</b> {stats.soldSeats}</div>
            <div><b>Voľné miesta:</b> {stats.totalSeats - stats.soldSeats}</div>
            <div><b>Obsadenosť:</b> {stats.occupancy} %</div>
          </div>
        </div>
      </div>

      {/* TERMINY OVERVIEW */}
      <div style={{ marginTop: 40 }}>
        <div className="headingSecondary">Najbližšie termíny</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {terminy.map((t) => {
            const occupancy = Math.round((t.sold / t.capacity) * 100)

            return (
              <div
                key={t.id}
                style={{
                  ...cardStyle,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t.nazov}</div>
                  <div style={{ fontSize: 13, color: "#777" }}>
                    {new Date(t.datumCas).toLocaleDateString("sk-SK")} {new Date(t.datumCas).toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20, fontSize: 14 }}>
                  <div><b>Obs:</b> {occupancy}%</div>
                  <div><b>Predané:</b> {t.sold}/{t.capacity}</div>
                  <div><b>Tržba:</b> {(t.revenue ?? 0)} €</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
