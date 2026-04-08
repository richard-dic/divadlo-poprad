import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const people = await prisma.person.findMany({
    where: {
      visible: true
    },
    orderBy: [
      { category: "asc" },
      { sortOrder: "asc" },
      { fullName: "asc" }
    ]
  })

  return NextResponse.json(people)
}