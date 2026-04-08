import ScanClient from "./ScanClient"

export default async function Page({
  params,
}: {
  params: Promise<{ terminId: string }>
}) {
  const resolvedParams = await params

  return <ScanClient terminId={Number(resolvedParams.terminId)} />
}