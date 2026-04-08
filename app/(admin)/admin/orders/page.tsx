"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Order = {
  id: number
  code: string
  email: string | null
  status: string
  totalAmount: number
  createdAt: string
  termin: {
    datumCas: string
    inscenacia: {
      nazov: string
    }
  }
}

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState("")
  const [codeFilter, setCodeFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      const res = await fetch("/api/admin/orders")

      if (!res.ok || cancelled) return

      const data: Order[] = await res.json()

      if (cancelled) return

      let filtered = data

      if (statusFilter) {
        filtered = filtered.filter(o => o.status === statusFilter)
      }

      if (codeFilter) {
        const normalized = codeFilter.toUpperCase()
        filtered = filtered.filter(o =>
          o.code.toUpperCase().includes(normalized)
        )
      }

      if (emailFilter) {
        const normalizedEmail = emailFilter.toLowerCase()
        filtered = filtered.filter(o =>
          o.email?.toLowerCase().includes(normalizedEmail)
        )
      }

      if (dateFilter) {
        filtered = filtered.filter(o => {
          const orderDate = new Date(o.createdAt)
          const selectedDate = new Date(dateFilter)

          return (
            orderDate.getFullYear() === selectedDate.getFullYear() &&
            orderDate.getMonth() === selectedDate.getMonth() &&
            orderDate.getDate() === selectedDate.getDate()
          )
        })
      }

      setOrders(filtered)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [statusFilter, codeFilter, emailFilter, dateFilter])

  return (
    <div className="adminContainer">
      <h1 className="headingPrimary" style={{ marginBottom: 20 }}>Objednávky</h1>

      {/* FILTER */}
      <div className="ordersFilter">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
          style={{ minWidth: 120 }}
        >
          <option value="">Všetky</option>
          <option value="PAID">Zaplatené</option>
          <option value="RESERVED_UNPAID">Nezaplatené</option>
        </select>

        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{
            padding: "10px 8px",
            background: "#f5f5f5",
            border: "1px solid #ddd",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
            fontWeight: 600
          }}>
            ORD-
          </span>
          <input
            className="input"
            placeholder="XXXX-XXXX"
            value={codeFilter.replace(/^ORD-/, "")}
            onChange={(e) => {
              let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
              if (val.length > 4) val = val.slice(0,4) + "-" + val.slice(4,8)
              if (val.length > 9) val = val.slice(0,9)
              setCodeFilter(val ? `ORD-${val}` : "")
            }}
            style={{ minWidth: 160 }}
          />
        </div>

        <input
          className="input"
          placeholder="Email"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          style={{ minWidth: 200 }}
        />

        <input
          type="date"
          className="input"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {orders.length === 0 && <p>Žiadne objednávky</p>}

      <div style={{ display: "grid", gap: 16 }}>
      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            background: "#fff",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #eee",
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href={`/admin/orders/${o.id}`}>
              <strong>{o.code}</strong>
            </Link>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#666" }}>
                {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", marginTop: 2 }}>
                {o.totalAmount} €
              </div>
            </div>
          </div>

          <div style={{ fontWeight: 500 }}>
            {o.termin.inscenacia.nazov}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#555" }}>
            <span>Email: {o.email || "—"}</span>
            <span>Status: {o.status}</span>
          </div>
        </div>
      ))}
      </div>

      <style jsx>{`
        .ordersFilter {
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: nowrap;
          justify-content: center;
        }

        .ordersFilter :global(select),
        .ordersFilter :global(input) {
          height: 40px;
        }

        @media (max-width: 900px) {
          .ordersFilter {
            flex-wrap: wrap;
            justify-content: flex-start;
          }

          .ordersFilter :global(select),
          .ordersFilter :global(input) {
            flex: 1 1 100%;
          }
        }
      `}</style>
    </div>
  )
}