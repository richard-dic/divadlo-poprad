type SeatEvent =
  | { type: "ORDER_UPDATED" }
  | { type: "ORDER_CANCELLED" }
  | { type: "ORDER_PAID" }
  | { type: "CHECKED_IN"; ticketId: number }

type Listener = (event: SeatEvent) => void

let listeners: Listener[] = []

export function subscribe(listener: Listener) {
  listeners.push(listener)

  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function broadcastSeatUpdate(event: SeatEvent) {
  for (const listener of listeners) {
    listener(event)
  }
}