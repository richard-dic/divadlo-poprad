import { addClient, removeClient } from "@/lib/seatEvents"
import { requireApiRole } from "@/lib/requireApiRole"

export async function GET() {
  const auth = await requireApiRole(["ADMIN", "CONTROLLER"])

  if (auth instanceof Response) {
    return auth
  }

  let client: { send: (data: string) => void } | null = null
  let interval: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      client = {
        send: (data: string) => controller.enqueue(data)
      }

      addClient(client)

      interval = setInterval(() => {
        controller.enqueue(":\n\n")
      }, 20000)

      controller.enqueue("event: connected\ndata: ok\n\n")
    },

    cancel() {
      if (interval) clearInterval(interval)

      if (client) {
        removeClient(client)
      }
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  })
}