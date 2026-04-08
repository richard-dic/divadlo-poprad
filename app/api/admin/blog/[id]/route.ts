import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const numericId = Number(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Neplatné ID" }, { status: 400 })
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: numericId }
  })

  if (!post) {
    return NextResponse.json({ error: "Nenájdené" }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const { id } = await params
  const numericId = Number(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Neplatné ID" }, { status: 400 })
  }

  const body = await req.json()

  const {
    title,
    slug,
    excerpt,
    content,
    coverImage,
    heroImage
  } = body

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Neplatný názov" }, { status: 400 })
  }

  const post = await prisma.blogPost.update({
    where: { id: numericId },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      heroImage: heroImage || null
    }
  })

  return NextResponse.json(post)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const { id } = await params
  const numericId = Number(id)

  await prisma.blogPost.delete({
    where: { id: numericId }
  })

  return NextResponse.json({ success: true })
}