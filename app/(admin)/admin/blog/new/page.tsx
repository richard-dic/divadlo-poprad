"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/slug"
import ImageUpload from "@/components/ImageUpload"
import MarkdownEditor from "@/components/MarkdownEditor"

export default function NewBlog() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [heroImage, setHeroImage] = useState("")

  async function handleSubmit() {
    const clean = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImage.trim(),
      heroImage: heroImage.trim()
    }

    if (!clean.title) return alert("Zadaj nadpis")
    if (!clean.excerpt) return alert("Zadaj anotáciu")
    if (!clean.content) return alert("Zadaj obsah")
    if (!clean.coverImage) return alert("Zadaj cover obrázok")

    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...clean,
        heroImage: clean.heroImage || null
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Chyba pri ukladaní")
      return
    }

    router.push("/admin/blog")
  }

  return (
    <div className="adminContainer">

      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <button
          onClick={() => router.back()}
          className="secondaryBtn"
        >
          ← Späť
        </button>

        <h1 className="headingPrimary" style={{ marginBottom: 0 }}>
          NOVÝ ČLÁNOK
        </h1>

        <div style={{ width: 100 }} />
      </div>

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}
      >
        <div className="formGroup">
          <label>Názov</label>
          <input
            className="input"
            value={title}
            onChange={(e) => {
              const value = e.target.value
              setTitle(value)
              setSlug(generateSlug(value))
            }}
          />
        </div>

        <div className="formGroup">
          <label>Slug</label>
          <input
            className="input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <div style={{ marginTop: -10 }}>
          <MarkdownEditor label="Anotácia" value={excerpt} onChange={setExcerpt} />
        </div>

        <div style={{ marginTop: -10 }}>
          <MarkdownEditor label="Obsah článku" value={content} onChange={setContent} />
        </div>

        <div style={{
          fontSize: 13,
          fontWeight: 600,
          textTransform: "uppercase",
          color: "#555",
          letterSpacing: "0.5px",
          marginBottom: 6
        }}>
          Cover obrázok *
        </div>
        {coverImage && (
          <div
            style={{
              marginTop: 10,
              marginBottom: 10,
              maxWidth: 300,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #ddd"
            }}
          >
            <img
              src={coverImage}
              alt="cover"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        )}
        <ImageUpload value={coverImage} onUpload={setCoverImage} />

        <div style={{
          fontSize: 13,
          fontWeight: 600,
          textTransform: "uppercase",
          color: "#555",
          letterSpacing: "0.5px",
          marginBottom: 6
        }}>
          Hero obrázok
        </div>
        {heroImage && (
          <div
            style={{
              marginTop: 10,
              marginBottom: 10,
              maxWidth: 300,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #ddd"
            }}
          >
            <img
              src={heroImage}
              alt="hero"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        )}
        <ImageUpload value={heroImage} onUpload={setHeroImage} />

        <button className="primaryBtn" style={{ marginTop: 10 }} onClick={handleSubmit}>
          Uložiť článok
        </button>
      </div>
    </div>
  )
}