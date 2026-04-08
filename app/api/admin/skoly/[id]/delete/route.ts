import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.schoolInquiry.delete({
    where: { id: Number(id) }
  })

  return NextResponse.redirect(new URL("/admin/skoly", req.url))
}