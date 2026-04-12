import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

export async function uploadGeneratedFile(
  folder: string,
  fileName: string,
  buffer: Uint8Array | Buffer,
  contentType: string
) {
  const filePath = `${folder}/${fileName}`

  const { error } = await supabase.storage
    .from("generated")
    .upload(filePath, buffer, {
      contentType,
      upsert: true
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from("generated")
    .getPublicUrl(filePath)

  return {
    filePath,
    publicUrl: data.publicUrl
  }
}

export async function downloadGeneratedFile(filePath: string) {
  const { data, error } = await supabase.storage
    .from("generated")
    .download(filePath)

  if (error || !data) {
    throw new Error(error?.message || "Download failed")
  }

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export function getGeneratedFileUrl(filePath: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/generated/${filePath}`
}