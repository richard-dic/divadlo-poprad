import Image from "next/image"
import Link from "next/link"

export default function Hero() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%"
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(320px, 50vw, 700px)",
          overflow: "hidden" // 🔥 veľmi dôležité
        }}
      >
        <Image
          src="/hero/divadlo-hero.jpg"
          alt="Divadlo Poprad"
          fill
          priority
          style={{
            objectFit: "cover",
            objectPosition: "center 85%"
          }}
        />

        {/* OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1200,
              padding: "0 clamp(12px, 3vw, 40px)",
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                color: "#fff",
                maxWidth: 700
              }}
            >
              {/* TITLE */}
              <h1
                style={{
                  fontSize: "clamp(29px, 4.5vw, 80px)",
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                  letterSpacing: "0.5px",
                  textShadow: "0 6px 30px rgba(0,0,0,0.5)"
                }}
              >
                DIVADLO POPRAD
              </h1>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: "clamp(23px, 2.5vw, 55px)",
                  fontWeight: 300,
                  opacity: 0.95,
                  textShadow: "0 3px 15px rgba(0,0,0,0.5)"
                }}
              >
                Siedmy div Popradu
              </p>

              {/* BUTTONS */}
              <div
                style={{
                  marginTop: 22,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "flex-end"
                }}
              >
                <Link href="/program">
                  <button
                    style={{
                      background: "rgb(23,67,78)",
                      color: "#fff",
                      padding: "clamp(10px, 1.2vw, 14px) clamp(16px, 2vw, 26px)",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "clamp(15px, 1vw, 36px)"
                    }}
                  >
                    Program
                  </button>
                </Link>

                <Link href="/vstupenky">
                  <button
                    style={{
                      background: "rgb(23,67,78)",
                      color: "#fff",
                      padding: "clamp(10px, 1.2vw, 14px) clamp(16px, 2vw, 26px)",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "clamp(15px, 1vw, 36px)"
                    }}
                  >
                    Kúpiť lístok
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 TATRY DIVIDER */}
        {/* 🔥 FULL WIDTH TATRY */}
        <div
            style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100vw",
                zIndex: 3,
                pointerEvents: "none"
            }}
            >
            <Image
                src="/ui/tatry-divider.svg"
                alt=""
                width={2160} // 🔥 základná šírka SVG (kľudne nechaj)
                height={200} // 🔥 pomer výšky
                style={{
                width: "100vw",   // 🔥 natiahne na celú šírku
                height: "auto",   // 🔥 zachová celý tvar → nič sa neoreže
                display: "block"
                }}
            />
            </div>
      </div>
    </div>
  )
}