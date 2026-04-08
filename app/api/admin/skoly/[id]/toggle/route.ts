import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const item = await prisma.schoolInquiry.findUnique({
    where: { id: Number(id) }
  })

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.schoolInquiry.update({
    where: { id: Number(id) },
    data: { vybavene: !item.vybavene }
  })

  return NextResponse.redirect(new URL("/admin/skoly", req.url))
}