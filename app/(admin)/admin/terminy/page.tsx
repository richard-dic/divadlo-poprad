"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Termin = {
  id: number
  nazov: string
  datumCas: string
  capacity: number
  sold: number
  free: number
}

export default function Page() {
  const [terminy, setTerminy] = useState<Termin[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      const res = await fetch("/api/admin/terminy/overview")

      if (!res.ok || cancelled) return

      const data = await res.json()

      if (cancelled) return

      setTerminy(data)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = terminy.filter(t =>
    t.nazov.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="adminContainer">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        gap: 12,
        flexWrap: "wrap"
      }}>
        <h1 className="headingPrimary" style={{ marginBottom: 0 }}>Termíny</h1>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="input"
            placeholder="Vyhľadať predstavenie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
          />

          <Link href="/admin/terminy/new">
            <button className="primaryBtn">Pridať</button>
          </Link>
        </div>
      </div>

      {filtered.map((t) => (
        <div
          key={t.id}
          style={{
            background: "#fff",
            padding: 18,
            marginBottom: 14,
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <div>
            <Link href={`/admin/terminy/${t.id}`}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{t.nazov}</div>
            </Link>

            <div style={{ fontSize: 13, color: "#777", marginTop: 4 }}>
              {new Date(t.datumCas).toLocaleDateString("sk-SK")} {new Date(t.datumCas).toLocaleTimeString("sk-SK", { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 13, color: "#555", flexWrap: "wrap" }}>
              <span><strong>Kapacita:</strong> {t.capacity}</span>
              <span><strong>Predané:</strong> {t.sold}</span>
              <span><strong>Voľné:</strong> {t.free}</span>
            </div>
          </div>

          <div>
            <Link href={`/admin/terminy/${t.id}`}>
              <button className="secondaryBtn">Upraviť</button>
            </Link>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ color: "#777" }}>Žiadne termíny</div>
      )}
    </div>
  )
}