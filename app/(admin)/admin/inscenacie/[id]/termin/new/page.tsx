"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"

export default function NovyTermin() {
  const router = useRouter()
  const params = useParams()

  const [formData, setFormData] = useState({
    datumCas: "",
    priestor: "",
    typSedenia: "",
    zakladnaCena: 0,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    await fetch("/api/terminy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        zakladnaCena: Number(formData.zakladnaCena),
        inscenaciaId: Number(params.id),
      }),
    })

    router.push(`/admin/inscenacie/${params.id}`)
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Pridať termín</h1>

      <form onSubmit={handleSubmit}>
        <label>Dátum a čas:</label>
        <input
          type="datetime-local"
          name="datumCas"
          onChange={handleChange}
          required
        />
        <br /><br />

        <label>Priestor:</label>
        <input
          name="priestor"
          placeholder="Napr. Veľká sála"
          onChange={handleChange}
          required
        />
        <br /><br />

        <label>Typ sedenia:</label>
        <input
          name="typSedenia"
          placeholder="Napr. klasické"
          onChange={handleChange}
          required
        />
        <br /><br />

        <label>Cena:</label>
        <input
          type="number"
          name="zakladnaCena"
          placeholder="Napr. 12.50"
          onChange={handleChange}
          required
        />
        <br /><br />

        <button type="submit">Uložiť termín</button>
      </form>
    </div>
  )
}