"use client"

import { useState } from "react"

type User = {
  id: number
  email: string
  role: string
}

export default function EditUserForm({ user }: { user: User }) {
  const [open, setOpen] = useState(false)

  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState(user.role)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !role) {
      setError("Vyplň všetky povinné polia")
      return
    }

    if (!email.includes("@")) {
      setError("Zadaj správny email")
      return
    }

    if (password && password.length < 6) {
      setError("Heslo musí mať aspoň 6 znakov")
      return
    }

    if (password && password !== confirmPassword) {
      setError("Heslá sa nezhodujú")
      return
    }

    setError("")
    setLoading(true)

    const res = await fetch(`/api/admin/users/${user.id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        role
      })
    })

    setLoading(false)

    if (res.ok) {
      setOpen(false)
      location.reload() // jednoduchý refresh
    } else {
      const data = await res.json()
      setError(data.error || "Chyba pri úprave")
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div>
        <button className="primaryBtn" onClick={() => setOpen(!open)}>
          Upraviť
        </button>
      </div>

      {open && (
        <div
          style={{
            marginTop: 16,
            padding: 20,
            borderRadius: 10,
            border: "1px solid #eee",
            width: "100%",
            display: "block"
          }}
        >
          <div className="formGroup">
            <label className="formLabel">Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">Nové heslo (nepovinné)</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">Zopakuj heslo</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label className="formLabel">Rola</label>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ADMIN">Admin</option>
              <option value="CONTROLLER">Kontrolór</option>
              <option value="SELLER_INTERNAL">Interný predajca</option>
              <option value="SELLER_EXTERNAL">Externý predajca</option>
            </select>
          </div>

          {error && <div className="formError">{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button className="primaryBtn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Ukladám..." : "Uložiť zmeny"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}