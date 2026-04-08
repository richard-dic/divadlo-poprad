import { getCurrentUser } from "./auth"

export async function requireApiRole(roles: string[]) {

  const user = await getCurrentUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (!roles.includes(user.role)) {
    return new Response("Forbidden", { status: 403 })
  }

  return user
}