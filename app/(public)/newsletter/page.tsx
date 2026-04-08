"use client"

import { useState } from "react"

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [status, setStatus] = useState("")

  async function subscribe() {
    if (!name || !email) {
      setStatus("Prosím vyplňte meno a email")
      return
    }

    setStatus("loading")

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        name,
        birthDate
      })
    })

    const data = await res.json()

    if (res.ok) {
      setStatus("success")
      setEmail("")
      setName("")
      setBirthDate("")
    } else {
      setStatus(data.error || "error")
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 700 }}>
      <h1 className="headingPrimary" style={{ textAlign: "center" }}>
        NEWSLETTER
      </h1>

      <div className="newsletterWrapper">
        <div className="newsletterCard">

          <div className="formGroup">
            <label>Meno *</label>
            <input
              className="input"
              placeholder="Zadajte meno"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>Email *</label>
            <input
              className="input"
              placeholder="Zadajte email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="formGroup">
            <label>Dátum narodenia (voliteľné)</label>
            <input
              className="input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <button
            className="primaryBtn"
            onClick={subscribe}
            disabled={status === "loading"}
            style={{ width: "100%", marginTop: 10 }}
          >
            {status === "loading" ? "Odosielam..." : "Prihlásiť sa"}
          </button>

          {status === "success" && (
            <div className="formSuccess">
              Úspešne ste sa prihlásili na odber noviniek!
            </div>
          )}

          {status !== "" && status !== "success" && status !== "loading" && (
            <div className="formError">
              {status}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}