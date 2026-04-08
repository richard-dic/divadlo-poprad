"use client"

import { useState } from "react"
import SellerSeatMap from "@/components/SellerSeatMap"

export default function ExternalSellerPage({ params }: { params: { id: string } }) {
  const terminId = Number(params.id)

  return (
    <div style={{ padding: 40 }}>
      <h1>Externý predaj</h1>

      <SellerSeatMap
        terminId={terminId}
        mode="external"
      />
    </div>
  )
}