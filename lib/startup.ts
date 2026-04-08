import { startReservationCleanup } from "@/lib/cron/reservationCleanup"

let started = false

export function initApp() {
  if (started) return
  started = true

  startReservationCleanup()
  console.log("✅ Reservation cleanup started")
}