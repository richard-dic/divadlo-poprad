import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { broadcastSeatUpdate } from "@/lib/seatEvents"
import { requireApiRole } from "@/lib/requireApiRole"

export async function POST(req: Request) {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

  if (auth instanceof Response) {
    return auth
  }

  const { ticketId } = await req.json()

  if (!ticketId) {
    return NextResponse.json(
      { status: "INVALID" },
      { status: 400 }
    )
  }

  // 🔥 atomic update (žiadny race condition)
  const result = await prisma.ticket.updateMany({
    where: {
      id: ticketId,
      usedAt: null
    },
    data: {
      usedAt: new Date()
    }
  })

  // 🔥 ak nič neupdateol → už bol použitý alebo neexistuje
  if (result.count === 0) {
    return NextResponse.json({
      status: "USED"
    })
  }

  broadcastSeatUpdate({
    type: "CHECKED_IN",
    ticketId
  })

  return NextResponse.json({
    status: "CHECKED_IN"
  })
}