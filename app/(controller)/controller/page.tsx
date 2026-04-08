import { requireRole } from "@/lib/requireRole"
import ControllerDashboard from "./ControllerDashboard"

export default async function Page() {
  await requireRole(["ADMIN", "CONTROLLER"])

  return <ControllerDashboard />
}