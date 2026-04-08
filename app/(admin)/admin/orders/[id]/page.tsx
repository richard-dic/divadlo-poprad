"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Seat = {
  rad: number | null
  cislo: number | null
  stol: number | null
  stolicka: number | null
}

type Ticket = {
  id: number
  code: string
  usedAt: string | null
  seat: Seat
}

type Order = {
  id: number
  code: string
  email: string | null
  name: string | null
  status: string
  source: string
  totalAmount: number
  createdAt: string
  paidAt: string | null
  giftCardId: number | null

  termin: {
    datumCas: string
    hall: {
      nazov: string
    }
    inscenacia: {
      nazov: string
    }
  }

  tickets: Ticket[]
}

export default function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [order, setOrder] = useState<Order | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      const resolvedParams = await params
      const id = Number(resolvedParams.id)

      const res = await fetch(`/api/admin/orders/${id}`)

      if (!res.ok || cancelled) return

      const data = await res.json()

      if (cancelled) return

      setOrder(data)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [params])

  async function markPaid() {
    if (!order) return

    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "mark_paid" })
    })

    if (!res.ok) {
      alert("Chyba pri zmene stavu")
      return
    }

    location.reload()
  }

  async function cancelOrder() {
    if (!order) return

    const confirmed = window.confirm("Naozaj chceš ZRUŠIŤ túto objednávku? Táto akcia je nevratná a všetky rezervované miesta sa uvoľnia.")

    if (!confirmed) return

    const res = await fetch(`/api/admin/orders/${order.id}/cancel`, {
      method: "POST"
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba pri zrušení objednávky")
      return
    }

    location.reload()
  }

  if (!order) {
    return <div className="adminContainer">Načítavam...</div>
  }

  const filtered = [order.termin].filter(t =>
    t.inscenacia.nazov.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="adminContainer">
      <h1 className="headingPrimary">Termíny</h1>

      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <input
          className="input"
          placeholder="Vyhľadať predstavenie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.map((t) => (
        <div
          key={t.datumCas}
          style={{
            background: "#fff",
            padding: 18,
            marginBottom: 16,
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>

            <Link href={`/admin/terminy/${order.id}`}>
              <strong style={{ fontSize: 16 }}>{t.inscenacia.nazov}</strong>
            </Link>

            <div style={{ fontSize: 13, color: "#666" }}>
              {new Date(t.datumCas).toLocaleDateString("sk-SK")} {new Date(t.datumCas).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 14 }}>
            <div><strong>Kapacita:</strong> {0}</div>
            <div><strong>Predané:</strong> {0}</div>
            <div><strong>Voľné:</strong> {0}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <Link href={`/admin/terminy/${order.id}`}>
              <button className="secondaryBtn">Upraviť</button>
            </Link>
          </div>
        </div>
      ))}

      <div style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        marginBottom: 20
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>

          <div>
            <div style={{ fontSize: 14, color: "#777" }}>Status</div>
            <div style={{ fontWeight: 600 }}>{order.status}</div>
          </div>

          <div>
            <div style={{ fontSize: 14, color: "#777" }}>Zdroj</div>
            <div style={{ fontWeight: 600 }}>{order.source}</div>
          </div>

          <div>
            <div style={{ fontSize: 14, color: "#777" }}>Suma</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--primary)" }}>{order.totalAmount} €</div>
          </div>

        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 6 }}>
          <div><strong>Meno:</strong> {order.name || "—"}</div>
          <div><strong>Email:</strong> {order.email || "—"}</div>
          <div><strong>Gift card:</strong> {order.giftCardId ? `Áno (#${order.giftCardId})` : "Nie"}</div>
          <div><strong>Inscenácia:</strong> {order.termin.inscenacia.nazov}</div>
          <div>
            <strong>Dátum predstavenia:</strong>{" "}
            {new Date(order.termin.datumCas).toLocaleDateString("sk-SK")} {new Date(order.termin.datumCas).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div><strong>Sála:</strong> {order.termin.hall.nazov}</div>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {order.status === "RESERVED_UNPAID" && (
          <button className="primaryBtn" onClick={markPaid}>
            Označiť ako zaplatené
          </button>
        )}

        {order.status !== "CANCELLED" && (
          <button
            className="secondaryBtn"
            onClick={cancelOrder}
          >
            Zrušiť objednávku
          </button>
        )}
      </div>

      <h2 className="headingSecondary">Vstupenky</h2>

      {order.tickets.length === 0 && (
        <p>Objednávka momentálne nemá žiadne aktívne vstupenky.</p>
      )}

      {order.tickets.map((t) => (
        <div
          key={t.id}
          style={{
            marginBottom: 12,
            padding: 16,
            borderRadius: 10,
            background: "#fff",
            boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#777" }}>Kód</div>
            <div style={{ fontWeight: 600 }}>{t.code}</div>
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#777" }}>Miesto</div>
            <div>
              {t.seat.rad !== null
                ? `Rad ${t.seat.rad} / ${t.seat.cislo}`
                : `Stôl ${t.seat.stol} / ${t.seat.stolicka}`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, color: "#777" }}>Stav</div>
            <div style={{ fontWeight: 600, color: t.usedAt ? "#1E4D4F" : "#c9a24a" }}>
              {t.usedAt ? "Použitý" : "Nepoužitý"}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}