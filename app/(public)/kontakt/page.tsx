export default function ContactPage() {
  return (
    <div className="container section" style={{ maxWidth: 900 }}>
      <h1 className="headingPrimary">KONTAKT</h1>

      {/* INFO */}
      <div style={{ marginTop: 30, lineHeight: 1.7, fontSize: 16 }}>
        <p style={{ fontWeight: 600, fontSize: 18 }}>Divadlo POPRAD s. r. o.</p>
        <p>Scherfelova 1308/15<br />058 01 Poprad</p>

        <p style={{ marginTop: 10 }}>
          <b>IČO:</b> 54926289<br />
          <b>DIČ:</b> 2121818182
        </p>

        <h2 className="headingSecondary" style={{ marginTop: 30 }}>KONTAKTY</h2>

        <p style={{ marginTop: 20 }}>
          <b>Komunikácia s verejnosťou:</b><br />
          +421 917 069 601<br />
          <span style={{ color: "#666" }}>
            (utorok – sobota, 10:00 – 16:00)
          </span>
        </p>

        <p style={{ marginTop: 10 }}>
          <b>Komunikácia so školami:</b><br />
          <a href="tel:+421917069601">+421 917 069 601</a><br />
          <span style={{ color: "#666" }}>
            (utorok – sobota, 10:00 – 16:00)
          </span>
        </p>

        <p style={{ marginTop: 10 }}>
          <b>Kontakt s médiami:</b><br />
          zuzana.sucha@divadlopoprad.sk
        </p>

        <p style={{ marginTop: 10 }}>
          <b>Email:</b><br />
          <a href="mailto:info@divadlopoprad.sk">info@divadlopoprad.sk</a>
        </p>
      </div>

      {/* MAPA */}
      <div style={{ marginTop: 40 }}>
        <h2 className="headingSecondary">KDE NÁS NÁJDETE</h2>

        <div style={{ marginTop: 10 }}>
          <iframe
            src="https://www.google.com/maps?q=Scherfelova+1308/15+Poprad&output=embed"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}