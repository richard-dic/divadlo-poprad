import Link from "next/link"

export default function GiftCardSuccess() {
  return (
    <div className="container section" style={{ maxWidth: 700 }}>
      <h1 className="headingPrimary">DARČEKOVÁ POUKÁŽKA</h1>

      <div className="newsletterWrapper">
        <div className="newsletterCard" style={{ textAlign: "center" }}>

          <div style={{ fontSize: 64, marginBottom: 10, color: "var(--primary)" }}>✓</div>

          <h2 style={{ marginBottom: 10 }}>
            Poukážka bola úspešne zakúpená
          </h2>

          <p style={{ color: "#666", lineHeight: 1.6 }}>
            Kód poukážky vám bude zaslaný na email.
            <br />
            Skontrolujte si prosím aj priečinok spam, ak email nevidíte.
          </p>

          <Link
            href="/"
            className="primaryBtn"
            style={{ marginTop: 20, display: "inline-block" }}
          >
            Späť na hlavnú stránku
          </Link>

        </div>
      </div>
    </div>
  )
}