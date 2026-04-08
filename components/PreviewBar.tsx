"use client"

export default function PreviewBar() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  return (
    <div
      style={{
        width: "100%",
        background: "#111",
        color: "white",
        padding: "8px 20px",
        display: "flex",
        justifyContent: "space-between"
      }}
    >
      <div>👁️ Náhľad webu (ADMIN)</div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => (window.location.href = "/admin")}>
          Späť do admina
        </button>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  )
}