import fs from "fs"
import path from "path"
import React from "react"
import Gallery from "@/components/GalleryClient"

export default function GaleriaPage() {
  // TODO: nahradiť dynamickým načítaním (API route alebo server component)
  const dir = path.join(process.cwd(), "public/galeria/divadlo")
  const files = fs.readdirSync(dir)
  const images = files.map((file) => `/galeria/divadlo/${file}`)

  return (
    <div className="container section" style={{ maxWidth: 1200 }}>

      <h1 className="headingPrimary">GALÉRIA PRIESTOROV</h1>

      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.7 }}>
        Fotografie priestorov Divadla Poprad od fotografa Mateja Hakára
      </p>

      <Gallery images={images} />
    </div>
  )
}