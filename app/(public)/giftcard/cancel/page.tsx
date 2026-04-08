import Link from "next/link"

export default function GiftCardCancelPage() {
  return (
    <div className="container section" style={{ maxWidth: 700 }}>
      <h1 className="headingPrimary">DARČEKOVÁ POUKÁŽKA</h1>

      <div className="newsletterWrapper">
        <div className="newsletterCard" style={{ textAlign: "center" }}>

          <div style={{ fontSize: 64, marginBottom: 10, color: "#e74c3c" }}>
            ×
          </div>

          <h2 style={{ marginBottom: 10 }}>
            Platba bola zrušená
          </h2>

          <p style={{ color: "#666", lineHeight: 1.6 }}>
            Darčeková poukážka nebola zakúpená.
            <br />
            Môžete to skúsiť znova alebo sa vrátiť späť.
          </p>

          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>

            <Link
              href="/giftcard/buy"
              className="primaryBtn"
            >
              Skúsiť znova
            </Link>

            <Link
              href="/"
              className="primaryBtn"
              style={{ background: "#ccc", color: "#000" }}
            >
              Späť na hlavnú stránku
            </Link>

          </div>

        </div>
      </div>
    </div>
  )
}