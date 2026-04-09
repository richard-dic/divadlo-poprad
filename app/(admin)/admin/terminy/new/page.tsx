"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type Hall = {
  id: number
  nazov: string
}

type Inscenacia = {
  id: number
  nazov: string
}

const STUDIO_SEATING_OPTIONS = [
  { value: "TABLES", label: "Stoly" },
  { value: "ROWS", label: "Radové sedenie" },
  { value: "KIDS", label: "Detské sedenie" }
]

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")

  const inscenaciaIdParam = searchParams.get("inscenaciaId")

  const [inscenacie, setInscenacie] = useState<Inscenacia[]>([])
  const [halls, setHalls] = useState<Hall[]>([])

  const [inscenaciaId, setInscenaciaId] = useState<number>(
    inscenaciaIdParam ? Number(inscenaciaIdParam) : 0
  )
  const [hallId, setHallId] = useState<number>(0)
  const [datumCas, setDatumCas] = useState("")
  const [zakladnaCena, setZakladnaCena] = useState(10)
  const [typSedenia, setTypSedenia] = useState("")

  useEffect(() => {
    async function load() {
      const [inscRes, hallRes] = await Promise.all([
        fetch("/api/admin/inscenacie"),
        fetch("/api/admin/halls")
      ])

      const inscData = await inscRes.json()
      const hallData = await hallRes.json()

      setInscenacie(inscData)
      setHalls(hallData)

      if (!inscenaciaIdParam && inscData.length > 0) {
        setInscenaciaId(inscData[0].id)
      }

      if (hallData.length > 0) {
        setHallId(hallData[0].id)
      }
    }

    void load()
  }, [inscenaciaIdParam])

  // 🔥 ZISTENIE ČI JE ŠTÚDIO
  const selectedHall = halls.find((h) => h.id === hallId)
  const isStudio = selectedHall?.nazov === "Štúdio"

  async function createTermin() {
    // 🔥 VALIDÁCIA
    if (isStudio && !typSedenia) {
      alert("Vyber typ sedenia pre Štúdio")
      return
    }

    const res = await fetch("/api/admin/terminy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inscenaciaId,
        hallId,
        datumCas,
        zakladnaCena,
        typSedenia
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba")
      return
    }

    router.push(returnTo || `/admin/inscenacie/${inscenaciaId}`)
  }

  return (
    <div className="adminContainer">
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <h1 className="headingPrimary" style={{ marginBottom: 0 }}>
            NOVÝ TERMÍN
          </h1>

          <button className="primaryBtn" onClick={createTermin}>
            Vytvoriť termín
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
            border: "1px solid #eee",
            display: "grid",
            gap: 16
          }}
        >
          {/* INSCENÁCIA */}
          <div>
            <label className="formLabel">Inscenácia</label>
            <select
              className="input"
              value={inscenaciaId}
              onChange={(e) => setInscenaciaId(Number(e.target.value))}
            >
              {inscenacie.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nazov}
                </option>
              ))}
            </select>
          </div>

          {/* SÁLA */}
          <div>
            <label className="formLabel">Sála</label>
            <select
              className="input"
              value={hallId}
              onChange={(e) => {
                const newHallId = Number(e.target.value)
                setHallId(newHallId)

                const hall = halls.find((h) => h.id === newHallId)

                if (hall?.nazov !== "Štúdio") {
                  setTypSedenia("")
                }
              }}
            >
              {halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nazov}
                </option>
              ))}
            </select>
          </div>

          {/* DÁTUM */}
          <div>
            <label className="formLabel">Dátum a čas</label>
            <input
              className="input"
              type="datetime-local"
              value={datumCas}
              onChange={(e) => setDatumCas(e.target.value)}
            />
          </div>

          {/* CENA */}
          <div>
            <label className="formLabel">Cena (€)</label>
            <input
              className="input"
              type="number"
              value={zakladnaCena}
              onChange={(e) => setZakladnaCena(Number(e.target.value))}
            />
          </div>

          {/* TYP SEDENIA */}
          {isStudio && (
            <div>
              <label className="formLabel">Typ sedenia</label>
              <select
                className="input"
                value={typSedenia}
                onChange={(e) => setTypSedenia(e.target.value)}
              >
                <option value="">-- vyber --</option>
                {STUDIO_SEATING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button className="primaryBtn" onClick={createTermin}>
              Vytvoriť termín
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}