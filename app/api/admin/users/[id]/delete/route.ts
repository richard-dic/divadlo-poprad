import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireApiRole(["ADMIN"])

  if (auth instanceof Response) {
    return auth
  }

  const id = Number(params.id)

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