import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const { id } = await params
  const numericId = Number(id)

  const card = await prisma.giftCard.findUnique({
    where: { id: numericId },
    include: {
      transactions: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  })

  if (!card) {
    return NextResponse.json(
      { error: "Poukážka neexistuje" },
      { status: 404 }
    )
  }

  return NextResponse.json(card)
}