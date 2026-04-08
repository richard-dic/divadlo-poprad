"use client"

import Image from "next/image"

type Props = {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageGalleryUpload({ images, onChange }: Props) {
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (data.url) {
        uploaded.push(data.url)
      }
    }

    onChange([...images, ...uploaded])
  }

  function removeImage(index: number) {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <input type="file" multiple accept="image/*" onChange={handleUpload} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 10
        }}
      >
        {images.map((img, i) => (
          <div key={i} style={{ position: "relative", height: 100 }}>
            <Image
              src={img || "/default.jpg"}
              alt=""
              fill
              style={{ objectFit: "cover", borderRadius: 6 }}
            />

            <button
              onClick={() => removeImage(i)}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                background: "red",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}