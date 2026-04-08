"use client"

export default function AdminBar() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <div
      style={{
        width: "100%",
        background: "var(--primary)",
        color: "white",
        padding: "6px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative"
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 900 }}>
        ADMIN ROZHRANIE
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.5)",
            color: "#fff",
            padding: "4px 10px",
            fontSize: 13,
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Náhľad webu
        </button>

        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.5)",
            color: "#fff",
            padding: "4px 10px",
            fontSize: 13,
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}