import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      tickets: {
        include: {
          seat: true
        }
      },
      termin: {
        include: {
          inscenacia: true,
          hall: true
        }
      },
      giftCard: true
    }
  })

  if (!order) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(order)
}