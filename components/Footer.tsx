import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer
      style={{
        backgroundImage: "url('/backgrounds/colorBG_1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        padding: "50px 20px"
      }}
    >
      <div
        className="footerGrid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 40,
          alignItems: "start"
        }}
      >

        {/* KONTAKT */}
        <div style={{ width: "100%", maxWidth: 320, textAlign: "left" }}>
          <h3
            style={{
              marginBottom: 16,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.5px"
            }}
          >
            KONTAKTNÉ ÚDAJE
          </h3>

          <div style={{ fontWeight: 500 }}>0917 069 601</div>
          <div style={{ fontWeight: 500 }}>
            (utorok – sobota 10:00 – 16:00)
          </div>
          <div style={{ fontWeight: 500 }}>
            info@divadlopoprad.sk
          </div>

          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href="/obchodne-podmienky">
              <span style={{ textDecoration: "underline" }}>
                Obchodné podmienky
              </span>
            </Link>

            <Link href="/ochrana-osobnych-udajov">
              <span style={{ textDecoration: "underline" }}>
                Ochrana osobných údajov
              </span>
            </Link>
          </div>
        </div>



        {/* OBCHODNÉ */}
        <div style={{ width: "100%", maxWidth: 320, textAlign: "left" }}>
          <h3
            style={{
              marginBottom: 16,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.5px"
            }}
          >
            OBCHODNÉ ÚDAJE
          </h3>

          <div style={{ fontWeight: 500 }}>Divadlo Poprad s. r. o.</div>
          <div style={{ fontWeight: 500 }}>Scherfelova 1308/15</div>
          <div style={{ fontWeight: 500 }}>058 01 Poprad</div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 500 }}>IČO: 54926289</div>
            <div style={{ fontWeight: 500 }}>DIČ: 2121818182</div>
          </div>
        </div>

        {/* SOCIAL */}
        <div style={{ width: "100%", maxWidth: 320, textAlign: "left" }}>
          <h3
            style={{
              marginBottom: 16,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.5px"
            }}
          >
            NÁJDETE NÁS
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14
            }}
          >

            <Link
              href="https://www.facebook.com/divadlopoprad"
              target="_blank"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                <Image src="/icons/facebook.svg" alt="fb" width={28} height={28} />
                Divadlo Poprad
              </div>
            </Link>

            <Link
              href="https://www.instagram.com/divadlo_poprad?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                <Image src="/icons/instagram.svg" alt="ig" width={28} height={28} />
                divadlo_poprad
              </div>
            </Link>

            <Link
              href="https://www.youtube.com/@DivadloPoprad"
              target="_blank"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                <Image src="/icons/youtube.svg" alt="yt" width={28} height={28} />
                Divadlo Poprad
              </div>
            </Link>

          </div>
        </div>

      </div>
    </footer>
  )
}