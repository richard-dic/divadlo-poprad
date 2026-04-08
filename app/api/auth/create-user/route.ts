import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  try {
    const body = await req.json()

    const email = String(body.email || "")
    const password = String(body.password || "")
    const role = String(body.role || "USER")

    if (!email || !password) {
      return NextResponse.json(
        { error: "Chýbajú údaje" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Používateľ už existuje" },
        { status: 400 }
      )
    }

    const hashed = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role
      }
    })

    return NextResponse.json(user)
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}