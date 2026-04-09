import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const { id: idParam } = await params
  const id = Number(idParam)

  if (!id) {
    return NextResponse.json(
      { error: "Neplatné ID" },
      { status: 400 }
    )
  }

  await prisma.user.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}