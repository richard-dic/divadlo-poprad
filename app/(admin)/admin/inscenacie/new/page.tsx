"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import ImageUpload from "@/components/ImageUpload"
import ImageGalleryUpload from "@/components/ImageGalleryUpload"
import MarkdownEditor from "@/components/MarkdownEditor"

type FormType = {
  nazov: string
  anotacia: string
  obsah: string
  rezia: string
  credits: string
  dlzkaMinut: number
  vekovaKategoria: string
  datumPremiery: string
  typ: string
  viditelna: boolean
  coverImage: string
  heroImage: string
  trailerUrl: string
  galleryImages: string[]
}

export default function Page() {
  const router = useRouter()

  const [form, setForm] = useState<FormType>({
    nazov: "",
    anotacia: "",
    obsah: "",
    rezia: "",
    credits: "",
    dlzkaMinut: 120,
    vekovaKategoria: "15+",
    datumPremiery: "",
    typ: "DRÁMA",
    viditelna: true,
    coverImage: "",
    heroImage: "",
    trailerUrl: "",
    galleryImages: []
  })

  function update<K extends keyof FormType>(field: K, value: FormType[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validate() {
    if (!form.nazov.trim()) return "Názov je povinný"
    if (!form.anotacia.trim()) return "Anotácia je povinná"
    if (!form.obsah.trim()) return "Obsah je povinný"
    if (!form.credits.trim()) return "Credits sú povinné"
    if (!form.dlzkaMinut || form.dlzkaMinut <= 0) return "Dĺžka musí byť väčšia ako 0"
    if (!form.vekovaKategoria.trim()) return "Veková kategória je povinná"
    if (!form.datumPremiery.trim()) return "Dátum premiéry je povinný"
    if (!form.typ.trim()) return "Typ je povinný"
    if (!form.coverImage.trim()) return "Cover obrázok je povinný"
    return null
  }

  async function saveItem() {
    const error = validate()
    if (error) return alert(error)

    const clean = {
      ...form,
      nazov: form.nazov.trim(),
      anotacia: form.anotacia.trim(),
      obsah: form.obsah.trim(),
      rezia: form.rezia.trim(),
      credits: form.credits.trim(),
      vekovaKategoria: form.vekovaKategoria.trim(),
      typ: form.typ.trim(),
      coverImage: form.coverImage.trim(),
      heroImage: form.heroImage.trim(),
      trailerUrl: form.trailerUrl.trim()
    }

    const res = await fetch(`/api/admin/inscenacie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...clean,
        heroImage: clean.heroImage || null,
        trailerUrl: clean.trailerUrl || null
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba pri ukladaní")
      return
    }

    router.push("/admin/inscenacie")
  }

  return (
    <div className="adminContainer">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
            PRIDAŤ INSCENÁCIU
          </h1>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="primaryBtn" onClick={saveItem}>
              Uložiť
            </button>
          </div>
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
          <div>
            <label className="formLabel">Názov *</label>
            <input
              className="input"
              value={form.nazov}
              onChange={(e) => update("nazov", e.target.value)}
            />
          </div>

          <div>
            <label className="formLabel">Anotácia *</label>
            <textarea
              className="input"
              value={form.anotacia}
              onChange={(e) => update("anotacia", e.target.value)}
            />
          </div>

          <div>
            <label className="formLabel">Réžia</label>
            <input
              className="input"
              value={form.rezia}
              onChange={(e) => update("rezia", e.target.value)}
            />
          </div>

          <MarkdownEditor
            label="Obsah *"
            value={form.obsah}
            onChange={(val) => update("obsah", val)}
          />

          <MarkdownEditor
            label="Credits *"
            value={form.credits}
            onChange={(val) => update("credits", val)}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="formLabel">Dĺžka (min)</label>
              <input
                className="input"
                type="number"
                value={form.dlzkaMinut}
                onChange={(e) => update("dlzkaMinut", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="formLabel">Veková kategória</label>
              <input
                className="input"
                value={form.vekovaKategoria}
                onChange={(e) => update("vekovaKategoria", e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="formLabel">Dátum premiéry</label>
              <input
                className="input"
                type="datetime-local"
                value={form.datumPremiery}
                onChange={(e) => update("datumPremiery", e.target.value)}
              />
            </div>

            <div>
              <label className="formLabel">Typ</label>
              <input
                className="input"
                value={form.typ}
                onChange={(e) => update("typ", e.target.value)}
              />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              style={{ accentColor: "var(--primary)", width: 16, height: 16 }}
              checked={form.viditelna}
              onChange={(e) => update("viditelna", e.target.checked)}
            />
            Viditeľná
          </label>

          <div>
            <div className="formLabel">Cover obrázok *</div>
            <ImageUpload
              value={form.coverImage}
              onUpload={(url) => update("coverImage", url)}
            />
            {form.coverImage && (
              <div
                style={{
                  marginTop: 10,
                  width: 160,
                  height: 160,
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f3f3f3",
                  margin: "10px auto 0"
                }}
              >
                <Image src={form.coverImage} alt="cover" fill style={{ objectFit: "cover" }} />
              </div>
            )}
          </div>

          <div>
            <div className="formLabel">Hero obrázok</div>
            <ImageUpload
              value={form.heroImage}
              onUpload={(url) => update("heroImage", url)}
            />
            {form.heroImage && (
              <div
                style={{
                  marginTop: 10,
                  width: 200,
                  height: 120,
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f3f3f3",
                  margin: "10px auto 0"
                }}
              >
                <Image src={form.heroImage} alt="hero" fill style={{ objectFit: "cover" }} />
              </div>
            )}
          </div>

          <div>
            <div className="formLabel">Galéria</div>
            <ImageGalleryUpload
              images={form.galleryImages}
              onChange={(imgs) => update("galleryImages", imgs)}
            />
          </div>

          <div>
            <label className="formLabel">Trailer (YouTube URL)</label>
            <input
              className="input"
              value={form.trailerUrl}
              onChange={(e) => update("trailerUrl", e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button className="primaryBtn" onClick={saveItem}>
              Uložiť
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}