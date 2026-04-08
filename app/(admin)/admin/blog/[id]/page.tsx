"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"
import MarkdownEditor from "@/components/MarkdownEditor"

type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  heroImage?: string | null
}

export default function EditBlog() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)

  const [data, setData] = useState<BlogPost | null>(null)
  const [original, setOriginal] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/blog/${id}`)
      const json = await res.json()

      setData(json)
      setOriginal(json)
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return <div style={{ padding: 40 }}>Načítavam...</div>
  if (!data) return <div style={{ padding: 40 }}>Nenájdené</div>

  const post = data

  function update<K extends keyof BlogPost>(field: K, value: BlogPost[K]) {
    setData(prev => (prev ? { ...prev, [field]: value } : prev))
  }

  const hasChanges = JSON.stringify(data) !== JSON.stringify(original)

  function goBack() {
    if (hasChanges) {
      const ok = confirm("Máš neuložené zmeny. Naozaj chceš odísť?")
      if (!ok) return
    }

    router.push("/admin/blog")
  }

  async function save() {
    const clean = {
      ...post,
      title: post.title.trim(),
      slug: post.slug.trim(),
      excerpt: post.excerpt.trim(),
      content: post.content.trim(),
      coverImage: post.coverImage.trim(),
      heroImage: (post.heroImage || "").trim()
    }

    if (!clean.title) return alert("Zadaj nadpis")
    if (!clean.excerpt) return alert("Zadaj anotáciu")
    if (!clean.content) return alert("Zadaj obsah")
    if (!clean.coverImage) return alert("Zadaj cover obrázok")

    const res = await fetch(`/api/admin/blog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...clean,
        heroImage: clean.heroImage || null
      })
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Chyba")
      return
    }

    router.push("/admin/blog")
  }

  return (
    <div className="adminContainer">
      {/* HEADER ROW */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <button
          onClick={goBack}
          className="secondaryBtn"
        >
          ← Späť
        </button>

        <h1 className="headingPrimary" style={{ marginBottom: 0 }}>
          UPRAVIŤ ČLÁNOK
        </h1>

        <div style={{ width: 100 }} />
      </div>

      {/* FORM CARD */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
          border: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}
      >
        {/* TITLE */}
        <div className="formGroup">
          <label>Názov článku</label>
          <input
            value={post.title}
            onChange={(e) => update("title", e.target.value)}
            className="input"
          />
        </div>

        {/* SLUG */}
        <div className="formGroup">
          <label>Slug (URL)</label>
          <input
            value={post.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="input"
          />
        </div>

        {/* EXCERPT */}
        <div style={{ marginTop: -10 }}>
          <MarkdownEditor
            label="Anotácia"
            value={post.excerpt}
            onChange={(val) => update("excerpt", val)}
          />
        </div>

        {/* CONTENT */}
        <div style={{ marginTop: -10 }}>
          <MarkdownEditor
            label="Obsah článku"
            value={post.content}
            onChange={(val) => update("content", val)}
          />
        </div>

        {/* COVER */}
        <div>
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
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt="cover"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            )}
          </div>

          <ImageUpload
            value={post.coverImage}
            onUpload={(url) => update("coverImage", url)}
          />
        </div>

        {/* HERO */}
        <div>
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
            {post.heroImage && (
              <img
                src={post.heroImage}
                alt="hero"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            )}
          </div>

          <ImageUpload
            value={post.heroImage || ""}
            onUpload={(url) => update("heroImage", url)}
          />
        </div>

        {/* SAVE */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="primaryBtn" onClick={save}>
            Uložiť zmeny
          </button>
        </div>
      </div>
    </div>
  )
}