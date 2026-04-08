import Link from "next/link"

export default function PaymentCancel() {
  return (
    <div className="container section" style={{ textAlign: "center" }}>
      
      {/* Nadpis */}
      <div style={{ marginBottom: "20px" }}>
        <h1 className="headingPrimary" style={{ marginBottom: "10px" }}>
          Platba bola zrušená
        </h1>

        <div style={{ fontSize: "48px", color: "var(--primary)" }}>
          ✕
        </div>
      </div>

      {/* Text */}
      <p style={{ marginBottom: "30px", color: "#555" }}>
        Vaša objednávka nebola dokončená. 
        Ak ste platbu prerušili omylom, môžete sa vrátiť a skúsiť to znova.
      </p>

      {/* Tlačidlá */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
        
        <Link href="/">
          <button className="primaryBtn" style={{ width: "220px", justifyContent: "center", height: "40px" }}>
            Späť na hlavnú stránku
          </button>
        </Link>

        <Link href="/program">
          <button className="secondaryBtn" style={{ width: "220px", justifyContent: "center", height: "40px" }}>
            Vybrať predstavenie
          </button>
        </Link>

      </div>

    </div>
  )
}