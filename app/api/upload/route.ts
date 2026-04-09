import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const data = await req.formData()
    const file = data.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const originalName = file.name.replace(/\.[^/.]+$/, "")
    const ext = file.name.split(".").pop() || "jpg"
    const safeName = originalName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")

    const fileName = `${Date.now()}-${safeName}.${ext}`
    const filePath = `images/${fileName}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error } = await supabase.storage
      .from("uploads")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrlData.publicUrl
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}