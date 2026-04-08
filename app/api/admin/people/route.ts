import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { PERSON_CATEGORY_OPTIONS } from "@/lib/personCategories"

export async function GET() {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const people = await prisma.person.findMany({
    orderBy: [
      { category: "asc" },
      { sortOrder: "asc" },
      { fullName: "asc" }
    ]
  })

  return NextResponse.json(people)
}

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  try {
    const body = await req.json()

    const fullName = String(body.fullName || "").trim()
    const roleLabel = String(body.roleLabel || "").trim()
    const bio = String(body.bio || "").trim()
    const imageUrl = String(body.imageUrl || "").trim()
    const category = String(body.category || "").trim()
    const visible = Boolean(body.visible)
    const sortOrder = Number(body.sortOrder || 0)

    if (!fullName || !roleLabel || !category) {
      return NextResponse.json(
        { error: "Chýbajú povinné údaje" },
        { status: 400 }
      )
    }

    if (!PERSON_CATEGORY_OPTIONS.includes(category as never)) {
      return NextResponse.json(
        { error: "Neplatná kategória" },
        { status: 400 }
      )
    }

    const created = await prisma.person.create({
      data: {
        fullName,
        roleLabel,
        bio: bio || null,
        imageUrl: imageUrl || null,
        category: category as never,
        visible,
        sortOrder
      }
    })

    return NextResponse.json(created)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}