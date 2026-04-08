"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function login() {
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Vyplňte všetky polia")
      setLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setError("Zadajte platný e-mail")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Prihlásenie zlyhalo")
      setLoading(false)
      return
    }

    if (data.redirect) {
      router.push(data.redirect)
    }
    setLoading(false)
  }

  return (
    <div className="container section" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "95vh" }}>
      
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
        }}
      >
        <h1 className="headingPrimary" style={{ textAlign: "center" }}>
          Prihlásenie
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            login()
          }}
        >
          <div className="formGroup">
            <label>Email</label>
            <input
              className="input"
              placeholder="email@domain.sk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>Heslo</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="formError">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primaryBtn"
            style={{
              width: "100%",
              marginTop: 10,
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Prihlasujem..." : "Prihlásiť sa"}
          </button>
        </form>

        
      </div>
    </div>
  )
}