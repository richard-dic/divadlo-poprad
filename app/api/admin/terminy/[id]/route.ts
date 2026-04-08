import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"
import { sendRescheduleEmail } from "@/lib/email/sendRescheduleEmail"

// 🔥 GET
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  if (!id) {
    return NextResponse.json(
      { error: "Neplatné ID" },
      { status: 400 }
    )
  }

  const termin = await prisma.terminHrania.findUnique({
    where: { id }
  })

  if (!termin) {
    return NextResponse.json(
      { error: "Termín neexistuje" },
      { status: 404 }
    )
  }

  return NextResponse.json(termin)
}

// 🔥 PUT
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])
  if (auth instanceof Response) return auth

  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  const body = await req.json()

  if (!id) {
    return NextResponse.json(
      { error: "Neplatné ID" },
      { status: 400 }
    )
  }

  const newDate = new Date(body.datumCas)
  const notifyUsers = Boolean(body.notifyUsers)

  if (Number.isNaN(newDate.getTime())) {
    return NextResponse.json(
      { error: "Neplatný dátum" },
      { status: 400 }
    )
  }

  const oldTermin = await prisma.terminHrania.findUnique({
    where: { id }
  })

  if (!oldTermin) {
    return NextResponse.json(
      { error: "Termín neexistuje" },
      { status: 404 }
    )
  }

  const updated = await prisma.terminHrania.update({
    where: { id },
    data: {
      datumCas: newDate
    }
  })

  // 🔥 EMAIL
  if (notifyUsers && oldTermin.datumCas.getTime() !== newDate.getTime()) {
    const orders = await prisma.order.findMany({
      where: {
        terminId: id,
        email: { not: null }
      }
    })

    await Promise.all(
      orders
        .filter((o) => o.email)
        .map((o) =>
          sendRescheduleEmail(
            o.email!,
            oldTermin.datumCas,
            newDate
          )
        )
    )
  }

  return NextResponse.json(updated)
}