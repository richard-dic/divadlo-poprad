import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const result = await prisma.reservationSeat.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })

  return NextResponse.json({
    deleted: result.count
  })
}