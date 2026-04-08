"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function PublicHeader() {
  const [openGift, setOpenGift] = useState(false)
  const [openDivadlo, setOpenDivadlo] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const giftTimeout = useRef<NodeJS.Timeout | null>(null)
  const divadloTimeout = useRef<NodeJS.Timeout | null>(null)

  const pathname = usePathname()

  function isActive(path: string) {
    return pathname === path
  }

  return (
    <div
      onClick={() => mobileOpen && setMobileOpen(false)}
      style={{
        position: "relative",
        backgroundImage: "url('/backgrounds/whiteBG.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center"
      }}>
      
      {/* 🔵 NAVBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          padding: "24px 40px",
          position: "relative",
          zIndex: 2000
        }}
      >
        {/* LOGO */}
        <div className="logoWrapper">
          <Link href="/" style={{ display: "block", width: "100%" }}>
            <Image
              src="/ui/logo.svg"
              alt="Divadlo Poprad"
              width={200}
              height={80}
              className="logo"
              sizes="(max-width: 480px) 56px, (max-width: 768px) 72px, (max-width: 1024px) 110px, 200px"
              style={{ width: "100%", height: "auto", cursor: "pointer", display: "block" }}
            />
          </Link>
        </div>

        {/* MENU */}
        <div className="desktop-menu">
          
          <NavLink href="/program" active={isActive("/program")}>
            Program
          </NavLink>

          <NavLink href="/inscenacie" active={isActive("/inscenacie")}>
            Inscenácie
          </NavLink>

          <NavLink href="/vstupenky" active={isActive("/vstupenky")}>
            Vstupenky
          </NavLink>

          <NavLink href="/skoly" active={isActive("/skoly")}>
            Pre školy
          </NavLink>

          <NavLink href="/blog" active={isActive("/blog")}>
            Blog
          </NavLink>

          {/* 🎁 GIFT */}
          <div
            onMouseEnter={() => {
              if (giftTimeout.current) clearTimeout(giftTimeout.current)
              setOpenGift(true)
              setOpenDivadlo(false)
            }}
            onMouseLeave={() => {
              giftTimeout.current = setTimeout(() => {
                setOpenGift(false)
              }, 300)
            }}
            style={{ position: "relative" }}
          >
            <span
              style={{
                cursor: "pointer",
                color: pathname.startsWith("/giftcard") ? "rgb(23,67,78)" : "rgb(10,10,12)",
                fontWeight: pathname.startsWith("/giftcard") ? "bold" : 400
              }}
            >
              Darčekové poukážky
            </span>

            {openGift && (
              <Dropdown>
                <Link href="/giftcard">Kúpiť poukážku</Link>
                <Link href="/giftcard/check">Skontrolovať stav</Link>
              </Dropdown>
            )}
          </div>

          {/* 🎭 DIVADLO */}
          <div
            onMouseEnter={() => {
              if (divadloTimeout.current) clearTimeout(divadloTimeout.current)
              setOpenDivadlo(true)
              setOpenGift(false)
            }}
            onMouseLeave={() => {
              divadloTimeout.current = setTimeout(() => {
                setOpenDivadlo(false)
              }, 300)
            }}
            style={{ position: "relative" }}
          >
            <span
              style={{
                cursor: "pointer",
                color: pathname.startsWith("/divadlo") || pathname.startsWith("/newsletter") ? "rgb(23,67,78)" : "rgb(10,10,12)",
                fontWeight: pathname.startsWith("/divadlo") || pathname.startsWith("/newsletter") ? "bold" : 400
              }}
            >
              O divadle
            </span>

            {openDivadlo && (
              <Dropdown>
                <Link href="/newsletter">Newsletter</Link>
                <Link href="/divadlo/ludia">Ľudia divadla</Link>
                <Link href="/divadlo/galeria">Galéria</Link>
                <Link href="/divadlo/historia">História</Link>
                <Link href="/divadlo/kaviaren">Kaviareň</Link>
                <Link href="/divadlo/parkovanie">Parkovanie</Link>
              </Dropdown>
            )}
          </div>

          

          <NavLink href="/kontakt" active={isActive("/kontakt")}>
            Kontakt
          </NavLink>

        </div>

        {/* 🍔 BURGER (mobile) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen(prev => !prev);
          }}
          style={{
            display: "none",
            fontSize: 28,
            cursor: "pointer",
            zIndex: 2000
          }}
          className="burger"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ width: 24, height: 3, background: "rgb(23,67,78)" }} />
            <span style={{ width: 24, height: 3, background: "rgb(23,67,78)" }} />
            <span style={{ width: 24, height: 3, background: "rgb(23,67,78)" }} />
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            background: "none",
            color: "rgb(10,10,12)",
            display: "flex",
            flexDirection: "column",
            padding: 20,
            paddingTop: 140,
            gap: 20,
            fontSize: 18,
            zIndex: 10
          }}
        >
          <Link href="/program" onClick={() => setMobileOpen(false)} style={{ fontWeight: 500 }}>Program</Link>
          <Link href="/inscenacie" onClick={() => setMobileOpen(false)} style={{ fontWeight: 500 }}>Inscenácie</Link>
          <Link href="/vstupenky" onClick={() => setMobileOpen(false)} style={{ fontWeight: 500 }}>Vstupenky</Link>
          <Link href="/skoly" onClick={() => setMobileOpen(false)} style={{ fontWeight: 500 }}>Pre školy</Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)} style={{ fontWeight: 500 }}>Blog</Link>
          <div>
            <div
              onClick={(e) => {
                e.stopPropagation()
                setOpenGift(prev => {
                  const next = !prev
                  if (next) setOpenDivadlo(false)
                  return next
                })
              }}
              style={{
                fontWeight: 500,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
            >
              <span>Darčekové poukážky</span>
              <span style={{ fontSize: 14 }}>{openGift ? "▲" : "▼"}</span>
            </div>

            {openGift && (
              <div style={{ display: "flex", flexDirection: "column", marginTop: 8, gap: 10, paddingLeft: 10 }}>
                <Link href="/giftcard" onClick={() => setMobileOpen(false)} style={{ fontSize: 16, opacity: 0.9 }}>Kúpiť poukážku</Link>
                <Link href="/giftcard/check" onClick={() => setMobileOpen(false)} style={{ fontSize: 16, opacity: 0.9 }}>Skontrolovať stav</Link>
              </div>
            )}
          </div>
          <div>
            <div
              onClick={(e) => {
                e.stopPropagation()
                setOpenDivadlo(prev => {
                  const next = !prev
                  if (next) setOpenGift(false)
                  return next
                })
              }}
              style={{
                fontWeight: 500,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
            >
              <span>O divadle</span>
              <span style={{ fontSize: 14 }}>{openDivadlo ? "▲" : "▼"}</span>
            </div>

            {openDivadlo && (
              <div style={{ display: "flex", flexDirection: "column", marginTop: 8, gap: 10, paddingLeft: 10 }}>
                <Link href="/newsletter" onClick={() => setMobileOpen(false)} style={{ fontSize: 16, opacity: 0.9 }}>Newsletter</Link>
                <Link href="/divadlo/ludia" onClick={() => setMobileOpen(false)} style={{ fontSize: 16, opacity: 0.9 }}>Ľudia divadla</Link>
                <Link href="/divadlo/galeria" onClick={() => setMobileOpen(false)} style={{ fontSize: 16, opacity: 0.9 }}>Galéria</Link>
                <Link href="/divadlo/historia" onClick={() => setMobileOpen(false)} style={{ fontSize: 16, opacity: 0.9 }}>História</Link>
                <Link href="/divadlo/kaviaren" onClick={() => setMobileOpen(false)} style={{ fontSize: 16, opacity: 0.9 }}>Kaviareň</Link>
                <Link href="/divadlo/parkovanie" onClick={() => setMobileOpen(false)} style={{ fontSize: 16, opacity: 0.9 }}>Parkovanie</Link>
              </div>
            )}
          </div>
          
          <Link href="/kontakt" onClick={() => setMobileOpen(false)} style={{ fontWeight: 500 }}>Kontakt</Link>
        </div>
      )}

      {/* 🟢 TATRY */}
      <div
        style={{
          position: "relative",
          height: 100,
          marginTop: mobileOpen ? (openDivadlo ? 540 : (openGift ? 400 : 320)) : -50,
          zIndex: 1,
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div style={{ width: "100%", maxWidth: 2160, height: "100%", display: "flex", alignItems: "flex-end" }}>
          <Image
            src="/ui/tatry.svg"
            alt="Tatry"
            width={2160}
            height={220}
            style={{
              width: "100%",
              height: "auto",
              display: "block"
            }}
            priority
          />
        </div>
      </div>
      <style jsx>{`
        .desktop-menu {
          display: flex;
          gap: 32px;
          align-items: center;
          font-size: 22px;
          transform: translateY(-10px);
        }

        .desktop-menu a,
        .desktop-menu span {
          font-size: 22px;
          line-height: 1.2;
        }

        .logo {
          display: block;
          width: 100%;
          height: auto;
        }
        .logoWrapper {
          width: 200px;
          display: block;
          flex: 0 0 200px;
          overflow: hidden;
          line-height: 0;
        }
        @media (max-width: 1400px) {
          .desktop-menu {
            display: none !important;
          }
          .burger {
            display: block !important;
          }
          .logoWrapper {
            width: 170px;
            flex: 0 0 170px;
          }

          .desktop-menu {
            font-size: 16px;
            gap: 24px;
          }

          .desktop-menu a,
          .desktop-menu span {
            font-size: 16px;
          }
        }
        @media (max-width: 768px) {
          .logoWrapper {
            width: 140px;
            flex: 0 0 140px;
          }
        }
        @media (max-width: 480px) {
          .logoWrapper {
            width: 115px;
            flex: 0 0 115px;
          }
        }
      `}</style>
    </div>
  )
}

/* 🔵 NAV LINK */
function NavLink({
  href,
  children,
  active
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        fontWeight: active ? "bold" : 400,
        color: active ? "rgb(23,67,78)" : "rgb(10,10,12)",
        textDecoration: "none"
      }}
    >
      {children}
    </Link>
  )
}

/* 🔵 DROPDOWN */
function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dropdown"
      style={{
        position: "absolute",
        top: "110%",
        left: 0,
        background: "rgba(255,255,255,0.95)",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 12,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 220,
        zIndex: 100,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        backdropFilter: "blur(6px)"
      }}
    >
      {children}

      <style jsx>{`
        .dropdown :global(a) {
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: rgb(10,10,12);
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 16px;
        }

        .dropdown :global(a:hover) {
          background: rgba(23,67,78,0.08);
          color: rgb(23,67,78);
        }
      `}</style>
    </div>
  )
}