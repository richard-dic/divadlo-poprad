import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const terminId = Number(resolvedParams.id)

    if (!terminId) {
      return NextResponse.json(
        { error: "Neplatný terminId" },
        { status: 400 }
      )
    }

    const termin = await prisma.terminHrania.findUnique({
      where: { id: terminId }
    })

    if (!termin) {
      return NextResponse.json(
        { error: "Termín neexistuje" },
        { status: 404 }
      )
    }

    return NextResponse.json(termin)
  } catch (err) {
    console.error("TERMIN ERROR:", err)

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}