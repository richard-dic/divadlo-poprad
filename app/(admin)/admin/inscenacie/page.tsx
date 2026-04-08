"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

const infoBox: React.CSSProperties = {
  background: "transparent",
  borderRadius: 10,
  padding: "10px 12px",
  border: "1px solid var(--primary)",
  fontSize: 13
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#777",
  marginBottom: 4
}

type Item = {
  id: number
  nazov: string
  typ: string
  dlzkaMinut: number
  vekovaKategoria: string
  viditelna: boolean
  rezia?: string | null
  coverImage?: string
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    async function run() {
      const res = await fetch("/api/admin/inscenacie")
      if (!res.ok) return
      const data = await res.json()
      setItems(data)
    }
    run()
  }, [])

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
          PREHĽAD INSCENÁCIÍ
        </h1>

        <Link href="/admin/inscenacie/new" className="primaryBtn">
          Pridať inscenáciu
        </Link>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
              border: "1px solid #eee",
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 16
            }}
          >
            {/* IMAGE 1:1 */}
            <div
              style={{
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: 12,
                overflow: "hidden",
                background: "#f3f3f3"
              }}
            >
              <Image
                src={item.coverImage || "/default.jpg"}
                alt={item.nazov}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* CONTENT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {item.nazov}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 10
                }}
              >
                {item.rezia && (
                  <div style={infoBox}>
                    <div style={labelStyle}>Réžia</div>
                    <div>{item.rezia}</div>
                  </div>
                )}

                <div style={infoBox}>
                  <div style={labelStyle}>Typ</div>
                  <div>{item.typ}</div>
                </div>

                <div style={infoBox}>
                  <div style={labelStyle}>Dĺžka</div>
                  <div>{item.dlzkaMinut} min</div>
                </div>

                <div style={infoBox}>
                  <div style={labelStyle}>Vek</div>
                  <div>{item.vekovaKategoria}</div>
                </div>

                <div style={infoBox}>
                  <div style={labelStyle}>Viditeľnosť</div>
                  <div>{item.viditelna ? "Áno" : "Nie"}</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 10
                }}
              >
                <Link
                  href={`/admin/inscenacie/${item.id}`}
                  className="secondaryBtn"
                >
                  Upraviť
                </Link>

                <button
                  className="primaryBtn"
                  onClick={async () => {
                    const ok = window.confirm("Naozaj chceš vymazať túto inscenáciu?")
                    if (!ok) return

                    const res = await fetch(`/api/admin/inscenacie/${item.id}`, {
                      method: "DELETE"
                    })

                    if (!res.ok) {
                      alert("Chyba pri mazaní")
                      return
                    }

                    setItems((prev) => prev.filter((i) => i.id !== item.id))
                  }}
                >
                  Vymazať
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}