"use client"

import { useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"

export default function QRScanner({
  onScan,
}: {
  onScan: (code: string) => void
}) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        onScan(decodedText)
      },
      () => {}
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [onScan])

  return <div id="qr-reader" style={{ width: "100%", maxWidth: "420px" }} />
}