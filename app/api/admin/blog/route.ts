import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const body = await req.json()

  const {
    title,
    slug,
    excerpt,
    content,
    coverImage,
    heroImage
  } = body

  // ✅ VALIDÁCIA
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Neplatný názov" }, { status: 400 })
  }

  if (!slug || typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Neplatný slug" }, { status: 400 })
  }

  if (!excerpt || typeof excerpt !== "string") {
    return NextResponse.json({ error: "Neplatná anotácia" }, { status: 400 })
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Neplatný obsah" }, { status: 400 })
  }

  if (!coverImage || typeof coverImage !== "string") {
    return NextResponse.json({ error: "Neplatný obrázok" }, { status: 400 })
  }

  if (heroImage && typeof heroImage !== "string") {
    return NextResponse.json({ error: "Neplatný hero obrázok" }, { status: 400 })
  }

  // 🔥 kontrola unikátneho slug
  const exists = await prisma.blogPost.findUnique({
    where: { slug }
  })

  if (exists) {
    return NextResponse.json(
      { error: "Slug už existuje" },
      { status: 400 }
    )
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      heroImage: heroImage || null,
      publishedAt: new Date()
    }
  })

  return NextResponse.json(post)
}

// 👉 ADMIN LIST
export async function GET() {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const posts = await prisma.blogPost.findMany({
    orderBy: {
      publishedAt: "desc"
    }
  })

  return NextResponse.json(posts)
}