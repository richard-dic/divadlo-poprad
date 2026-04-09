import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import bcrypt from "bcrypt"
import { Prisma } from "@prisma/client"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const { id: idParam } = await params
  const id = Number(idParam)

  const { email, password, role } = await req.json()

  if (!email || !role) {
    return NextResponse.json(
      { error: "Chýbajú údaje" },
      { status: 400 }
    )
  }

  const data: Prisma.UserUpdateInput = {
    email,
    role
  }

  if (password && password.trim() !== "") {
    const hashed = await bcrypt.hash(password, 10)
    data.password = hashed
  }

  const user = await prisma.user.update({
    where: { id },
    data
  })

  return NextResponse.json(user)
}