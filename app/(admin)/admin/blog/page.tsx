"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

type BlogPost = {
  id: number
  title: string
  slug: string
  publishedAt: string
  coverImage: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/blog")
        const data = await res.json()
        setPosts(data)
      } catch {
        alert("Chyba načítania blogu")
      }
    }

    fetchData()
  }, [])

  async function remove(id: number) {
    if (!confirm("Naozaj chceš vymazať článok?")) return

    const res = await fetch(`/api/admin/blog/${id}`, {
      method: "DELETE"
    })

    if (!res.ok) {
      alert("Chyba pri mazaní")
      return
    }

    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="adminContainer">

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 10
      }}>
        <h1 className="headingPrimary" style={{ margin: 0 }}>
          PREHĽAD BLOGOVÝCH PRÍSPEVKOV
        </h1>

        <Link href="/admin/blog/new">
          <button className="primaryBtn">
            + Pridať článok
          </button>
        </Link>
      </div>

      {/* SEARCH */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: 30
      }}>
        <input
          placeholder="Vyhľadať podľa názvu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: 400, width: "100%" }}
        />
      </div>

      {/* LIST */}
      <div style={{ display: "grid", gap: 20 }}>
        {filtered.map(p => (
          <div
            key={p.id}
            style={{
              display: "flex",
              gap: 20,
              background: "#fff",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            {/* IMAGE */}
            <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
              <Image
                src={p.coverImage || "/default.jpg"}
                alt={p.title}
                fill
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
            </div>

            {/* TEXT */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 600 }}>
                {p.title}
              </div>
              <div style={{ color: "#777", marginTop: 4 }}>
                {new Date(p.publishedAt).toLocaleDateString("sk-SK")}
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end"
            }}>
              <Link href={`/admin/blog/${p.id}`}>
                <button className="primaryBtn" style={{ minWidth: 120 }}>
                  Upraviť
                </button>
              </Link>

              <button
                onClick={() => remove(p.id)}
                className="secondaryBtn"
                style={{ minWidth: 120 }}
              >
                Vymazať
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}