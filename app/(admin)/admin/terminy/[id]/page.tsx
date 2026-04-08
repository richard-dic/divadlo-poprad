"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type Termin = {
  id: number
  datumCas: string
}

export default function TerminEditPage() {
  const params = useParams()
  const router = useRouter()

  const id = Number(params.id)

  const [, setTermin] = useState<Termin | null>(null)
  const [datumCas, setDatumCas] = useState("")
  const [notifyUsers, setNotifyUsers] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 🔥 LOAD
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/terminy/${id}`)
      if (!res.ok) return

      const data = await res.json()

      setTermin(data)
      setDatumCas(data.datumCas.slice(0, 16)) // pre datetime-local
      setLoading(false)
    }

    if (id) load()
  }, [id])

  // 🔥 SAVE
  async function save() {
    if (!datumCas) return

    setSaving(true)

    const res = await fetch(`/api/admin/terminy/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        datumCas,
        notifyUsers
      })
    })

    setSaving(false)

    if (res.ok) {
      alert("Uložené")
      router.push("/admin/terminy")
    } else {
      alert("Chyba pri ukladaní")
    }
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Načítavam...</div>
  }

  return (
    <div className="adminContainer" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 className="headingPrimary" style={{ textAlign: "center" }}>Upraviť termín</h1>

      <div style={{
        background: "#fff",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
        maxWidth: 500,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div className="formGroup" style={{ width: "100%" }}>
          <label className="formLabel">Dátum a čas</label>

          <input
            type="datetime-local"
            className="input"
            value={datumCas}
            onChange={(e) => setDatumCas(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={notifyUsers}
              onChange={(e) => setNotifyUsers(e.target.checked)}
              style={{
                width: 18,
                height: 18,
                accentColor: "var(--primary)",
                cursor: "pointer"
              }}
            />
            <span>Upozorniť divákov emailom</span>
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <button
            className="primaryBtn"
            onClick={save}
            disabled={saving}
            style={{ marginTop: 24 }}
          >
            {saving ? "Ukladá sa..." : "Uložiť"}
          </button>
        </div>
      </div>
    </div>
  )
}