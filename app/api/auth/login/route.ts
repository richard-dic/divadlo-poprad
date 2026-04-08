import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { UserRole } from "@prisma/client"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 401 }
    )
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    return NextResponse.json(
      { error: "Wrong password" },
      { status: 401 }
    )
  }

  await createSession(user.id)

  let redirect = "/"

  // 🔥 ADMIN
  if (user.role === UserRole.ADMIN) {
    redirect = "/admin"
  }

  // 🔥 CONTROLLER
  else if (user.role === UserRole.CONTROLLER) {
    redirect = "/scan"
  }

  // 🔥 SELLERS
  else if (
    user.role === UserRole.SELLER_INTERNAL ||
    user.role === UserRole.SELLER_EXTERNAL
  ) {
    redirect = "/predaj"
  }

  return NextResponse.json({
    success: true,
    redirect
  })
}