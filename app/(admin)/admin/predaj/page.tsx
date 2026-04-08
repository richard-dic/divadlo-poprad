"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Termin = {
  id: number
  datumCas: string
  inscenacia: { nazov: string }
  hall: { nazov: string }
}

export default function AdminPredajPage() {
  const [terminy, setTerminy] = useState<Termin[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/terminy")

        if (!res.ok) {
          console.error("Chyba pri načítaní termínov:", res.status)
          return
        }

        const data: Termin[] = await res.json()
        setTerminy(data)
      } catch (err) {
        console.error("Fetch error:", err)
      }
    }

    void load()
  }, [])

  const filtered = terminy.filter((t) =>
    t.inscenacia.nazov.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="adminContainer">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <h1 className="headingPrimary" style={{ marginBottom: 0 }}>
          PREDAJ LÍSTKOV
        </h1>
      </div>

      <div style={{ maxWidth: 500, margin: "0 auto 30px" }}>
        <input
          className="input"
          placeholder="Vyhľadať podľa názvu inscenácie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        {filtered.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
              border: "1px solid #eee"
            }}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {t.inscenacia.nazov}
              </div>

              <div style={{ fontSize: 14, color: "#555" }}>
                {new Date(t.datumCas).toLocaleString("sk-SK")}
              </div>

              <div style={{ fontSize: 14, color: "#555" }}>
                {t.hall.nazov}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <Link href={`/admin/predaj/${t.id}`}>
                <button className="primaryBtn">
                  Otvoriť predaj
                </button>
              </Link>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#777" }}>
            Nenašli sa žiadne výsledky
          </div>
        )}
      </div>
    </div>
  )
}