import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

  if (auth instanceof Response) return auth

  try {
    const { code } = await req.json()

    if (!code || !code.startsWith("ORD-")) {
      return NextResponse.json(
        { status: "INVALID" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { code },
      include: {
        tickets: {
          include: {
            seat: true
          }
        },
        termin: {
          include: {
            inscenacia: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ status: "INVALID" })
    }

    return NextResponse.json({
      status: order.status === "PAID" ? "ALREADY_PAID" : "UNPAID_ORDER",
      orderId: order.id,
      orderCode: order.code,
      nazov: order.termin.inscenacia.nazov,
      datumCas: order.termin.datumCas,
      seats: order.tickets.map((t) => ({
        id: t.id,
        seat: t.seat
      })),
      totalAmount: order.totalAmount
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { status: "ERROR" },
      { status: 500 }
    )
  }
}