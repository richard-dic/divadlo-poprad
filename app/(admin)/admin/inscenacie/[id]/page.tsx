"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import ImageUpload from "@/components/ImageUpload"
import ImageGalleryUpload from "@/components/ImageGalleryUpload"
import MarkdownEditor from "@/components/MarkdownEditor"

type Termin = {
  id: number
  datumCas: string
  zakladnaCena: number
  typSedenia: string | null
  zrusene: boolean
  hall: {
    nazov: string
  }
}

type ItemResponse = {
  id: number
  nazov: string
  anotacia: string
  obsah: string
  rezia: string | null
  credits: string | null
  dlzkaMinut: number
  vekovaKategoria: string
  datumPremiery: string
  typ: string
  viditelna: boolean
  coverImage: string | null
  heroImage: string | null
  trailerUrl: string | null
  galleryImages: string[]
  terminy: Termin[]
}

export default function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()

  const [id, setId] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)

  const [nazov, setNazov] = useState("")
  const [anotacia, setAnotacia] = useState("")
  const [obsah, setObsah] = useState("")
  const [rezia, setRezia] = useState("")
  const [credits, setCredits] = useState("")
  const [dlzkaMinut, setDlzkaMinut] = useState(120)
  const [vekovaKategoria, setVekovaKategoria] = useState("15+")
  const [datumPremiery, setDatumPremiery] = useState("")
  const [typ, setTyp] = useState("DRÁMA")
  const [viditelna, setViditelna] = useState(true)

  const [coverImage, setCoverImage] = useState("")
  const [heroImage, setHeroImage] = useState("")
  const [trailerUrl, setTrailerUrl] = useState("")
  const [galleryImages, setGalleryImages] = useState<string[]>([])

  const [terminy, setTerminy] = useState<Termin[]>([])

  useEffect(() => {
    async function run() {
      const resolvedParams = await params
      const numericId = Number(resolvedParams.id)

      const res = await fetch(`/api/admin/inscenacie/${numericId}`)
      const data: ItemResponse = await res.json()

      setId(numericId)

      setNazov(data.nazov)
      setAnotacia(data.anotacia)
      setObsah(data.obsah || "")
      setRezia(data.rezia || "")
      setCredits(data.credits || "")
      setDlzkaMinut(data.dlzkaMinut)
      setVekovaKategoria(data.vekovaKategoria)
      setDatumPremiery(new Date(data.datumPremiery).toISOString().slice(0, 16))
      setTyp(data.typ)
      setViditelna(data.viditelna)

      setCoverImage(data.coverImage || "")
      setHeroImage(data.heroImage || "")
      setTrailerUrl(data.trailerUrl || "")
      setGalleryImages(data.galleryImages || [])

      setTerminy(data.terminy || [])
      setLoaded(true)
    }

    void run()
  }, [params])

  function validate() {
    if (!nazov.trim()) return "Názov je povinný"
    if (!anotacia.trim()) return "Anotácia je povinná"
    if (!obsah.trim()) return "Obsah je povinný"
    if (!rezia.trim()) return "Réžia je povinná"
    if (!credits.trim()) return "Credits sú povinné"
    if (!dlzkaMinut || dlzkaMinut <= 0) return "Dĺžka musí byť väčšia ako 0"
    if (!vekovaKategoria.trim()) return "Veková kategória je povinná"
    if (!datumPremiery.trim()) return "Dátum premiéry je povinný"
    if (!typ.trim()) return "Typ je povinný"
    if (!coverImage.trim()) return "Cover obrázok je povinný"

    return null
  }

  async function saveItem() {
    if (!id) return

    const error = validate()

    if (error) {
      alert(error)
      return
    }

    const res = await fetch(`/api/admin/inscenacie/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nazov,
        anotacia,
        obsah,
        rezia,
        credits,
        dlzkaMinut,
        vekovaKategoria,
        datumPremiery,
        typ,
        viditelna,
        coverImage,
        heroImage,
        trailerUrl,
        galleryImages
      })
    })

    const data: { error?: string } = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba pri ukladaní")
      return
    }

    alert("Uložené")
  }

  async function deleteItem() {
    if (!id) return

    const confirmed = window.confirm("Naozaj chceš zmazať túto inscenáciu?")
    if (!confirmed) return

    const res = await fetch(`/api/admin/inscenacie/${id}`, {
      method: "DELETE"
    })

    const data: { error?: string } = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba pri mazaní")
      return
    }

    router.push("/admin/inscenacie")
  }

  if (!loaded) {
    return <div style={{ padding: 40 }}>Načítavam...</div>
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
            UPRAVIŤ INSCENÁCIU
          </h1>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="primaryBtn" onClick={saveItem}>
              Uložiť
            </button>
            <button className="secondaryBtn" onClick={deleteItem}>
              Vymazať
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
            <input className="input" value={nazov} onChange={(e) => setNazov(e.target.value)} />
          </div>

          <div>
            <label className="formLabel">Anotácia *</label>
            <textarea className="input" value={anotacia} onChange={(e) => setAnotacia(e.target.value)} />
          </div>

          <div>
            <label className="formLabel">Réžia *</label>
            <input className="input" value={rezia} onChange={(e) => setRezia(e.target.value)} />
          </div>

          <MarkdownEditor label="Obsah *" value={obsah} onChange={setObsah} />
          <MarkdownEditor label="Credits *" value={credits} onChange={setCredits} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="formLabel">Dĺžka (min)</label>
              <input className="input" type="number" value={dlzkaMinut} onChange={(e) => setDlzkaMinut(Number(e.target.value))} />
            </div>

            <div>
              <label className="formLabel">Veková kategória</label>
              <input className="input" value={vekovaKategoria} onChange={(e) => setVekovaKategoria(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="formLabel">Dátum premiéry</label>
              <input className="input" type="datetime-local" value={datumPremiery} onChange={(e) => setDatumPremiery(e.target.value)} />
            </div>

            <div>
              <label className="formLabel">Typ</label>
              <input className="input" value={typ} onChange={(e) => setTyp(e.target.value)} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              style={{ accentColor: "var(--primary)", width: 16, height: 16 }}
              checked={viditelna}
              onChange={(e) => setViditelna(e.target.checked)}
            />
            Viditeľná
          </label>

          {/* COVER */}
          <div>
            <div className="formLabel">Cover obrázok *</div>
            <ImageUpload value={coverImage} onUpload={setCoverImage} />
            {coverImage && (
              <div style={{ marginTop: 10, width: 160, height: 160, position: "relative", borderRadius: 10, overflow: "hidden", background: "#f3f3f3", margin: "10px auto 0" }}>
                <Image src={coverImage} alt="Cover" fill style={{ objectFit: "cover" }} />
              </div>
            )}
          </div>

          {/* HERO */}
          <div>
            <div className="formLabel">Hero obrázok</div>
            <ImageUpload value={heroImage} onUpload={setHeroImage} />
            {heroImage && (
              <div style={{ marginTop: 10, width: 220, height: 120, position: "relative", borderRadius: 10, overflow: "hidden", background: "#f3f3f3", margin: "10px auto 0" }}>
                <Image src={heroImage} alt="Hero" fill style={{ objectFit: "cover" }} />
              </div>
            )}
          </div>

          <div>
            <div className="formLabel">Galéria</div>
            <ImageGalleryUpload images={galleryImages} onChange={setGalleryImages} />
          </div>

          <div>
            <label className="formLabel">Trailer</label>
            <input className="input" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button className="primaryBtn" onClick={saveItem}>Uložiť</button>
            <button className="secondaryBtn" onClick={deleteItem}>Vymazať</button>
          </div>
        </div>

        {/* TERMINY */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className="headingSecondary" style={{ margin: 0 }}>Termíny</h2>

            {id && (
              <Link
                href={`/admin/terminy/new?inscenaciaId=${id}&returnTo=${encodeURIComponent(`/admin/inscenacie/${id}`)}`}
                className="primaryBtn"
              >
                Pridať termín
              </Link>
            )}
          </div>

          {terminy.length === 0 && (
            <div style={{ color: "#777" }}>Žiadne termíny</div>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            {terminy.map((t) => (
              <Link
                key={t.id}
                href={`/admin/terminy/${t.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: "1px solid #eee",
                    background: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "0.15s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)"
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#eee"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#000" }}>
                      {new Date(t.datumCas).toLocaleString("sk-SK")}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>{t.hall.nazov}</div>
                  </div>

                  <div style={{ fontSize: 13, color: "#000" }}>
                    {t.zakladnaCena} €
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}