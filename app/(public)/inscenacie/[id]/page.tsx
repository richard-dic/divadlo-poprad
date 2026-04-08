import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import GalleryClient from "@/components/GalleryClient"
import Link from "next/link"

const getYoutubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v")
      return `https://www.youtube.com/embed/${id}`
    }

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${parsed.pathname}`
    }

    return url
  } catch {
    return url
  }
}

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  if (!id) return notFound()

  const item = await prisma.divadelnaInscenacia.findUnique({
    where: { id }
  })

  const now = new Date()
  const terminy = await prisma.terminHrania.findMany({
    where: {
      zrusene: false,
      inscenaciaId: id,
      datumCas: { gte: now }
    },
    include: {
      hall: true
    },
    orderBy: {
      datumCas: "asc"
    }
  })

  const dni = [
    "NEDEĽA","PONDELOK","UTOROK","STREDA",
    "ŠTVRTOK","PIATOK","SOBOTA"
  ]

  if (!item || !item.viditelna) return notFound()

  return (
    <div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "30px 20px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap"
          }}
        >
          <h1 className="headingPrimary" style={{ margin: 0 }}>
            {item.nazov}
          </h1>

          {item.vekovaKategoria && (
            <div
              style={{
                width: 50,
                height: 50,
                background: "var(--primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                borderRadius: 12
              }}
            >
              {item.vekovaKategoria}
            </div>
          )}
        </div>

        {/* META */}
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "#777",
            textTransform: "uppercase",
            letterSpacing: 0.5
          }}
        >
          {item.rezia && (
            <>réžia {item.rezia}</>
          )}
          {item.rezia && item.dlzkaMinut ? (
            <span style={{ margin: "0 10px", fontWeight: 700, color: "#aaa" }}>|</span>
          ) : null}
          {item.dlzkaMinut && (
            <>dĺžka {item.dlzkaMinut} minút</>
          )}
        </div>
      </div>
      {item.heroImage && (
        <div
          style={{
            maxWidth: 900,
            margin: "10px auto 0",
            padding: "0 20px"
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}
          >
            <Image
              src={item.heroImage || "/default.jpg"}
              alt={item.nazov}
              fill
              style={{ objectFit: "contain", background: "#fff" }}
            />
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "30px 20px 40px" }}>

        {/* 🔥 OBSAH */}
        <div
          style={{
            marginTop: 10,
            lineHeight: 1.7,
            fontSize: 15,
            textAlign: "justify"
          }}
        >
          <ReactMarkdown>{item.obsah}</ReactMarkdown>
        </div>

        {/* 🔥 CREDITS */}
        {item.credits && (
          <div style={{ marginTop: 10 }}>
            <h2 className="headingSecondary">Realizačný tím</h2>
            <ReactMarkdown>{item.credits}</ReactMarkdown>
          </div>
        )}

        <div style={{ marginTop: 30 }}>
          <b>Premiéra:</b>{" "}
          {new Date(item.datumPremiery).toLocaleDateString("sk-SK")}
        </div>

        {item.galleryImages?.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 className="headingSecondary">Galéria</h2>
            <GalleryClient images={item.galleryImages} />
          </div>
        )}

        {item.trailerUrl && (
          <div style={{ marginTop: 40 }}>
            <h2 className="headingSecondary">Video ukážka</h2>

            <div
              style={{
                marginTop: 10,
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
              }}
            >
              <iframe
                src={getYoutubeEmbedUrl(item.trailerUrl)}
                title="Trailer"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none"
                }}
              />
            </div>
          </div>
        )}

        {terminy.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 className="headingSecondary">Najbližšie termíny</h2>

            {terminy.map((t) => {
              const date = new Date(t.datumCas)
              const dayName = dni[date.getDay()]
              const datum = `${date.getDate()}.${date.getMonth() + 1}.`

              return (
                <div key={t.id} className="programRow">

                  <div className="programTop programLeft">
                    <div className="programDateBig">{datum}</div>
                    <div className="programDay">{dayName}</div>

                    <div className="programTime">
                      {date.toLocaleTimeString("sk-SK", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>

                  <div className="programBottom programRight" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="programHall">
                        {t.hall?.nazov}
                      </div>

                      <Link href={`/terminy/${t.id}/kupit`}>
                        <button className="buyBtn">
                          Kúpiť lístok
                        </button>
                      </Link>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}