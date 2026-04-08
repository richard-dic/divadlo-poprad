"use client"
import { useEffect, useState } from "react"

type GiftCard = {
  id: number
  code: string
  initialAmount: number
  remainingAmount: number
  active: boolean
  createdAt: string
}
import CreateGiftCardForm from "./CreateGiftCardForm"

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([])
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    fetch("/api/admin/giftcards")
      .then(res => res.json())
      .then(data => setCards(data))
  }, [])

  return (
    <div className="adminContainer">

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30
      }}>
        <h1 className="headingPrimary" style={{ marginBottom: 0 }}>
          PREHĽAD POUKÁŽOK
        </h1>

        <button
          className="primaryBtn"
          onClick={() => setShowCreate(prev => !prev)}
        >
          {showCreate ? "Zavrieť formulár" : "Pridať poukážku"}
        </button>
      </div>

      {showCreate && (
        <div style={{ marginBottom: 30 }}>
          <CreateGiftCardForm />
        </div>
      )}

      {/* LIST */}
      <div style={{ display: "grid", gap: 20 }}>
        {cards.map(card => (
          <div
            key={card.id}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #eee",
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10
            }}
          >

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {card.code}
                </div>
                <div style={{ fontSize: 12, color: card.active ? "#2e7d32" : "#c62828", fontWeight: 600 }}>
                  {card.active ? "Aktívna" : "Neaktívna"}
                </div>
              </div>

              <div style={{ fontSize: 13, color: "#555" }}>
                Pôvodná suma: <b>{card.initialAmount} €</b>
              </div>

              <div style={{ fontSize: 13, color: "#555" }}>
                Zostatok: <b>{card.remainingAmount} €</b>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, color: "#aaa" }}>
                {new Date(card.createdAt).toLocaleDateString()}
              </div>
              <div>
                {card.active && (
                  <form action={`/api/admin/giftcards/${card.id}/deactivate`} method="POST">
                    <button className="primaryBtn">
                      Deaktivovať
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}