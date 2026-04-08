"use client"

import { useState } from "react"


type Props = {
  value?: string
  onUpload: (url: string) => void
}

export default function ImageUpload({ value, onUpload }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    setLoading(false)

    if (data.url) {
      onUpload(data.url)
    }
  }

  return (
    <div className="formGroup" style={{ marginTop: 10 }}>
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed #d9e2e2",
          borderRadius: 12,
          padding: "28px 20px",
          cursor: "pointer",
          background: "#fff",
          transition: "all 0.2s ease",
          textAlign: "center"
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: "none" }}
        />

        <div
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 6,
            fontWeight: 600
          }}
        >
          Nahrať obrázok
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#999"
          }}
        >
          klikni alebo pretiahni súbor
        </div>
      </label>

      {loading && (
        <div style={{ fontSize: 14, color: "#777", textAlign: "center" }}>
          Nahrávam obrázok...
        </div>
      )}

    </div>
  )
}