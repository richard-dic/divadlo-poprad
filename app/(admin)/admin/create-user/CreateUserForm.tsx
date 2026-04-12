"use client"

import { useState } from "react"

export default function CreateUserForm() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("CONTROLLER")
  const [error, setError] = useState("")

  async function createUser() {
    if (!email || !password || !confirmPassword || !role) {
      setError("Vyplň všetky polia")
      return
    }
    if (!email.includes("@")) {
      setError("Zadaj správny email")
      return
    }
    if (password.length < 6) {
      setError("Heslo musí mať aspoň 6 znakov")
      return
    }
    if (password !== confirmPassword) {
      setError("Heslá sa nezhodujú")
      return
    }
    setError("")

    const res = await fetch("/api/admin/users/create", {
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

    if (res.ok) {
      alert("User created")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setRole("CONTROLLER")

      window.location.reload()
    } else {
      const data = await res.json()
      alert(data.error || "Error creating user")
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        createUser()
      }}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >

      <h2 className="headingSecondary" style={{ textAlign: "center", marginBottom: 20 }}>
        Nový používateľ
      </h2>

      <div className="formGroup">
        <label className="formLabel">Email</label>
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="formGroup">
        <label className="formLabel">Heslo</label>
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
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <button type="submit" className="primaryBtn">
          Vytvoriť používateľa
        </button>
      </div>

    </form>
  )

}