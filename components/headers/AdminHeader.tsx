"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export default function AdminHeader() {
  

  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1200)
    }

    // initial check
    handleResize()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        backgroundImage: "url('/backgrounds/colorBG_1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <img src="/ui/logo_white.svg" alt="Divadlo" style={{ height: 80 }} />

          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              ☰
            </button>
          )}
        </div>

        {(!isMobile || menuOpen) && (
          <div
            style={{
              display: "flex",
              gap: 26,
              flexDirection: isMobile ? "column" : "row",
              justifyContent: isMobile ? "flex-start" : "flex-end",
              alignItems: "center",
              width: isMobile ? "100%" : "auto",
              background: "transparent",
              padding: isMobile ? 20 : 0,
              marginTop: isMobile ? 16 : 0
            }}
          >
            <Link href="/admin">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Dashboard
              </span>
            </Link>
            <Link href="/admin/terminy">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Termíny
              </span>
            </Link>
            <Link href="/admin/orders">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Objednávky
              </span>
            </Link>
            <Link href="/admin/predaj">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Predaj
              </span>
            </Link>
            <Link href="/admin/inscenacie">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Inscenácie
              </span>
            </Link>
            <Link href="/admin/giftcards">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Gift cards
              </span>
            </Link>
            <Link href="/admin/create-user">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Používatelia
              </span>
            </Link>
            <Link href="/admin/ludia">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Ľudia
              </span>
            </Link>
            <Link href="/admin/blog">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Blog
              </span>
            </Link>

            {/* 🔥 NOVÉ */}
            <Link href="/admin/skoly">
              <span style={{ color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700, padding: "8px 0" }}>
                Školy (formuláre)
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}