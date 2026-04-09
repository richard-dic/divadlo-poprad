import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const hashed = await bcrypt.hash("admin123", 10)

    await prisma.user.upsert({
      where: { email: "admin@divadlo.sk" },
      update: {},
      create: {
        email: "admin@divadlo.sk",
        password: hashed,
        role: "ADMIN",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Seed prebehol úspešne",
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { success: false, error: "Seed zlyhal" },
      { status: 500 }
    )
  }
}