import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10)

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 })
  }

  if (!request.body) {
    return NextResponse.json({ error: "Request body is empty" }, { status: 400 })
  }

  try {
    // Generate a unique filename to prevent collisions
    const uniqueFilename = `${nanoid()}-${filename}`

    // Upload to Vercel Blob storage
    const blob = await put(uniqueFilename, request.body, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error uploading file to Vercel Blob:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
