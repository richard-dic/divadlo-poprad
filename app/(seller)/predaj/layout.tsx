import { requireRole } from "@/lib/requireRole"
import OperatorHeader from "@/components/headers/OperatorHeader"

export default async function PredajLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await requireRole([
    "ADMIN",
    "CONTROLLER",
    "SELLER_INTERNAL",
    "SELLER_EXTERNAL"
  ])

  return (
    <>
      <OperatorHeader role={user.role} area="seller" />
      {children}
    </>
  )
}