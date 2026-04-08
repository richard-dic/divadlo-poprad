import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"

export default async function Page() {
  const inscenacie = await prisma.divadelnaInscenacia.findMany({
    where: {
      viditelna: true
    },
    orderBy: {
      datumPremiery: "desc"
    }
  })

  return (
    <div style={{ padding: "60px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 className="headingPrimary">REPERTOÁR</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {inscenacie.map((item) => (
          <Link
            key={item.id}
            href={`/inscenacie/${item.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                display: "flex",
                gap: 20,
                borderRadius: 12,
                background: "white",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                padding: 20,
                position: "relative",
                alignItems: "flex-start"
              }}
            >
              {/* veková kategória */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "var(--color-primary)",
                  color: "white",
                  fontWeight: 700,
                  width: 50,
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8
                }}
              >
                {item.vekovaKategoria}
              </div>

              {/* obrázok */}
              <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
                <Image
                  src={item.coverImage || "/default.jpg"}
                  alt={item.nazov}
                  fill
                  style={{ objectFit: "cover", borderRadius: 10 }}
                />
              </div>

              {/* obsah */}
              <div style={{ flex: 1 }}>
                <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 28 }}>
                  {item.nazov}
                </h2>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                    fontSize: 14,
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  {item.rezia && (
                    <span>Réžia: {item.rezia}</span>
                  )}

                  <span>|</span>

                  <span>Dĺžka {item.dlzkaMinut} minút</span>
                </div>

                <p
                  style={{
                    color: "#777",
                    lineHeight: 1.6
                  }}
                >
                  {item.anotacia}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}