import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  const data = await req.formData()
  const file = data.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const fileName = Date.now() + "-" + file.name.replace(/\s/g, "-")

  const uploadDir = path.join(process.cwd(), "public/uploads")

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const filePath = path.join(uploadDir, fileName)

  fs.writeFileSync(filePath, buffer)

  return NextResponse.json({
    url: `/uploads/${fileName}`
  })
}