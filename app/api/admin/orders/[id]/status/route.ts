import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { OrderStatus } from "@prisma/client"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  try {
    const { action } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      )
    }

    if (action === "mark_paid") {
      await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date()
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (e) {
    console.error(e)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}