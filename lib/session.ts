import { cookies } from "next/headers"

export async function createSession(userId: number) {

  const cookieStore = await cookies()

  cookieStore.set("session", String(userId), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/"
})

}

export async function getSession() {

  const cookieStore = await cookies()

  return cookieStore.get("session")?.value

}

export async function destroySession() {

  const cookieStore = await cookies()

  cookieStore.delete("session")

}