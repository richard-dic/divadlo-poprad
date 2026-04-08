import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const { email, password, role } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: "Chýbajú údaje" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role
    }
  })

  return NextResponse.json(user)
}