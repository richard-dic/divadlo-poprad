"use client"

import { useState } from "react"
import Image from "next/image"

type FormType = {
  meno: string
  email: string
  telefon: string
  skola: string
  funkcia: string
  zaujem: string[]
  poznamka: string
}

export default function SkolyPage() {
  const [form, setForm] = useState<FormType>({
    meno: "",
    email: "",
    telefon: "",
    skola: "",
    funkcia: "",
    zaujem: [],
    poznamka: ""
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function update<K extends keyof FormType>(field: K, value: FormType[K]) {
    setSuccess("")
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggle(value: string) {
    setForm(prev => ({
      ...prev,
      zaujem: prev.zaujem.includes(value)
        ? prev.zaujem.filter(v => v !== value)
        : [...prev.zaujem, value]
    }))
  }

  function validate() {
    if (!form.meno.trim()) return "Zadaj meno"
    if (!form.email.includes("@")) return "Neplatný email"
    if (!form.telefon.trim()) return "Zadaj telefón"
    if (!form.skola.trim()) return "Zadaj školu"
    if (!form.funkcia.trim()) return "Zadaj funkciu"
    if (form.zaujem.length === 0) return "Vyber aspoň jednu možnosť"
    return ""
  }

  async function submit() {
    const err = validate()
    if (err) {
      setError(err)
      return
    }

    setError("")

    const res = await fetch("/api/contact/skoly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      setSuccess("Formulár bol úspešne odoslaný!")
      setError("")
      setForm({
        meno: "",
        email: "",
        telefon: "",
        skola: "",
        funkcia: "",
        zaujem: [],
        poznamka: ""
      })
    } else {
      setSuccess("")
      setError("Nastala chyba pri odosielaní")
    }
  }

  return (
    <div className="container section">
      <h1 className="headingPrimary">PONUKA PRE ŠKOLY</h1>

      {/* 🖼️ OBRÁZKY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 30 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ position: "relative", width: "100%", aspectRatio: "3/2", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}>
            <Image
              src={`/skoly/${i}.jpg`}
              alt=""
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>

      <p style={{ marginTop: 10, lineHeight: 1.6 }}><strong>Vážení pedagógovia!</strong></p>

      <p style={{ marginTop: 10, lineHeight: 1.6, textAlign: "justify" }}>
        Divadlo Poprad otvorilo svoje brány a ponúka predstavenia pre školy.
      </p>

      {/* 🟢 FORM */}
      <h2 className="headingSecondary" style={{ marginTop: 40 }}>ZÁUJEM O PREDSTAVENIE</h2>

      <div className="newsletterWrapper" style={{ width: "100%" }}>
        <div className="newsletterCard" style={{ width: "100%", maxWidth: "100%" }}>
          {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

          <div className="formRowTwo">
            {/* MENO */}
            <div className="formGroup">
              <label style={{ textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>Meno a priezvisko *</label>
              <input
                className="input"
                value={form.meno}
                onChange={e => update("meno", e.target.value)}
              />
            </div>

            {/* FUNKCIA */}
            <div className="formGroup">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>Funkcia *</label>
                <span style={{ fontSize: 12, color: "gray" }}>
                  napr. učiteľ, učiteľka, riaditeľ...
                </span>
              </div>
              <input
                className="input"
                value={form.funkcia}
                onChange={e => update("funkcia", e.target.value)}
              />
            </div>
          </div>

          <div className="formRowTwo">
            {/* EMAIL */}
            <div className="formGroup">
              <label style={{ textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>Email *</label>
              <input
                className="input"
                value={form.email}
                onChange={e => update("email", e.target.value)}
              />
            </div>

            {/* TELEFON */}
            <div className="formGroup">
              <label style={{ textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>Telefón *</label>
              <input
                className="input"
                value={form.telefon}
                onChange={e => update("telefon", e.target.value)}
              />
            </div>
          </div>

          {/* SKOLA */}
          <div className="formGroup">
            <label style={{ textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>Škola *</label>
            <input
              className="input"
              value={form.skola}
              onChange={e => update("skola", e.target.value)}
            />
          </div>

          {/* ZAUJEM */}
          <div className="formGroup">
            <label style={{ textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>Záujem o predstavenie pre: *</label>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-light)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "var(--color-accent-light)", cursor: "pointer" }}
                  checked={form.zaujem.includes("Materské školy")}
                  onChange={() => toggle("Materské školy")}
                />
                <span>Materské školy</span>
              </label>
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-light)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "var(--color-accent-light)", cursor: "pointer" }}
                  checked={form.zaujem.includes("1. stupeň ZŠ")}
                  onChange={() => toggle("1. stupeň ZŠ")}
                />
                <span>1. stupeň ZŠ</span>
              </label>
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-light)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "var(--color-accent-light)", cursor: "pointer" }}
                  checked={form.zaujem.includes("2. stupeň ZŠ")}
                  onChange={() => toggle("2. stupeň ZŠ")}
                />
                <span>2. stupeň ZŠ</span>
              </label>
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-accent-light)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  style={{ accentColor: "var(--color-accent-light)", cursor: "pointer" }}
                  checked={form.zaujem.includes("Stredné školy")}
                  onChange={() => toggle("Stredné školy")}
                />
                <span>Stredné školy</span>
              </label>
            </div>
          </div>

          {/* POZNAMKA */}
          <div className="formGroup">
            <label style={{ textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>Poznámka</label>
            <textarea
              className="input"
              value={form.poznamka}
              onChange={e => update("poznamka", e.target.value)}
              rows={4}
            />
          </div>

          {/* BUTTON */}
          <button className="primaryBtn" onClick={submit} style={{ marginTop: 20, display: "block", marginLeft: "auto", marginRight: "auto" }}>
            Odoslať
          </button>
          {success && (
            <div style={{ color: "var(--color-accent-light)", marginTop: 15, textAlign: "center", fontWeight: 500 }}>
              {success}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .formRowTwo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .formRowTwo {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}