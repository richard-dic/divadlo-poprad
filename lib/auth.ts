import { getSession } from "./session"
import { prisma } from "./prisma"

export async function getCurrentUser() {

  const session = await getSession()

  if (!session) return null

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session)
    }
  })

  return user

}