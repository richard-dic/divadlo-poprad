"use client"

import Link from "next/link"

type Role = "ADMIN" | "CONTROLLER" | "SELLER_INTERNAL" | "SELLER_EXTERNAL"

export default function OperatorHeader({
  role,
  area
}: {
  role: Role
  area: "scan" | "seller"
}) {
  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    })

    window.location.href = "/"
  }

  const isController = role === "CONTROLLER"
  const isAdmin = role === "ADMIN"
  const isInternalSeller = role === "SELLER_INTERNAL"
  const isExternalSeller = role === "SELLER_EXTERNAL"

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
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%"
        }}
      >
        {/* LEFT - LOGO + AREA */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src="/ui/logo_white.svg" alt="Divadlo" style={{ height: 60 }} />
        </div>

        {/* CENTER - NAV */}
        <div
          style={{
            display: "flex",
            gap: 26,
            alignItems: "center"
          }}
        >
          {area === "scan" && (
            <>
              <Link href="/scan">
                <span style={{ color: "#fff", fontWeight: 700 }}>Výber termínu</span>
              </Link>
              <Link href="/predaj">
                <span style={{ color: "#fff", fontWeight: 700 }}>Prepnúť na predaj</span>
              </Link>
            </>
          )}

          {area === "seller" && (
            <>
              {(isController || isAdmin) && (
                <Link href="/scan">
                  <span style={{ color: "#fff", fontWeight: 700 }}>Prepnúť na skenovanie</span>
                </Link>
              )}

              <Link href="/predaj">
                <span style={{ color: "#fff", fontWeight: 700 }}>Výber termínu</span>
              </Link>
            </>
          )}

          {isExternalSeller && area === "seller" && (
            <span style={{ opacity: 0.8 }}>Externý predajca</span>
          )}

          {(isInternalSeller || isController || isAdmin) && area === "seller" && (
            <span style={{ opacity: 0.8 }}>Predaj na mieste</span>
          )}
        </div>

        {/* RIGHT - LOGOUT */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontWeight: 600, opacity: 0.85 }}>
            {isExternalSeller
              ? "Predajca"
              : isInternalSeller
              ? "Predajca"
              : isController
              ? "Kontrolór"
              : isAdmin
              ? "Admin"
              : ""}
          </span>

          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.5)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}