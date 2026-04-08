import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function getCurrentUserServer() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session) return null

  const userId = Number(session.value)

  if (!userId) return null

  return prisma.user.findUnique({
    where: { id: userId }
  })
}