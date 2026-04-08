"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

export default function Gallery({ images }: { images: string[] }) {
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (active === null) return

      if (e.key === "Escape") setActive(null)
      if (e.key === "ArrowLeft") {
        setActive((prev) => (prev! > 0 ? prev! - 1 : prev))
      }
      if (e.key === "ArrowRight") {
        setActive((prev) => (prev! < images.length - 1 ? prev! + 1 : prev))
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [active, images.length])

  return (
    <>
      <div className="galleryGrid" style={{ marginTop: 30, display: "grid", gap: 24 }}>
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              cursor: "pointer",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              transition: "transform 0.3s ease",
            }}
            onClick={() => setActive(i)}
          >
            <div className="galleryImageInner">
              <Image src={src} alt="" fill style={{ objectFit: "cover" }} />
            </div>
          </div>
        ))}
      </div>

      {active !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(30, 77, 79, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <button
            onClick={() => setActive(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 30,
              fontSize: 30,
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            ×
          </button>

          <button
            onClick={() => setActive((prev) => (prev! > 0 ? prev! - 1 : prev))}
            style={{
              position: "absolute",
              left: 20,
              fontSize: 40,
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            ‹
          </button>

          <div
            style={{
              position: "relative",
              width: "80%",
              height: "80%",
              borderRadius: 12,
              overflow: "hidden"
            }}
          >
            <Image src={images[active]} alt="" fill style={{ objectFit: "contain" }} />
          </div>

          <button
            onClick={() => setActive((prev) => (prev! < images.length - 1 ? prev! + 1 : prev))}
            style={{
              position: "absolute",
              right: 20,
              fontSize: 40,
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            ›
          </button>
        </div>
      )}

      <style jsx>{`
        .galleryGrid {
          grid-template-columns: repeat(3, 1fr);
        }

        .galleryImageInner {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
          border-radius: 10px;
          overflow: hidden;
        }

        .galleryGrid div:hover {
          transform: scale(1.08);
          z-index: 10;
        }

        @media (max-width: 768px) {
          .galleryGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  )
}