import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET() {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const cards = await prisma.giftCard.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      transactions: true
    }
  })

  return NextResponse.json(cards)
}