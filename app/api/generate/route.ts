import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

// Simple schema/type for request payload
type GenerateBody = {
  propertyType: string
  location?: string
  priceRange?: string
  features?: string
  tone?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody

    const { propertyType = "Apartment", location = "", priceRange = "", features = "", tone = "Professional" } = body

    // Ask the model to return JSON so we can parse deterministically.
    const prompt = [
      "You are PropWrite, an assistant that crafts real estate listing content.",
      "Return strictly valid JSON with keys: description (string), socialPost (string), hashtags (array of 8-12 short strings).",
      "The description should be 100-160 words, polished and professional.",
      "The socialPost should be concise and engaging (max ~40 words).",
      "Hashtags must be single words prefixed with '#'.",
      "",
      `Inputs:`,
      `- Property type: ${propertyType}`,
      `- Location: ${location || "N/A"}`,
      `- Price range: ${priceRange || "N/A"}`,
      `- Features: ${features || "N/A"}`,
      `- Tone: ${tone}`,
      "",
      "Output only JSON. No markdown, no fences.",
    ].join("\n")

    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      prompt,
    })

    // Try to parse the model output as JSON
    let parsed: { description: string; socialPost: string; hashtags: string[] }
    try {
      parsed = JSON.parse(text)
    } catch {
      // Fallback if the model didn't return valid JSON
      parsed = {
        description:
          `${tone} ${propertyType} ${location ? "in " + location : ""}. ` +
          `Highlights: ${features || "well-designed spaces and modern amenities"}. ` +
          `${priceRange ? "Price range: " + priceRange + ". " : ""}` +
          `Schedule a visit to experience it firsthand.`,
        socialPost: `Explore a ${tone.toLowerCase()} ${propertyType}${location ? " in " + location : ""}! ${features || "Modern, spacious, and move-in ready."}`,
        hashtags: [
          "#RealEstate",
          "#NewListing",
          "#Home",
          "#Property",
          "#ForSale",
          "#PropTech",
          "#Invest",
          "#DreamHome",
        ],
      }
    }

    // Persist generation in Supabase (optional if integration is not yet connected)
    try {
      const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        cookies,
        headers,
      })

      const { error } = await supabase.from("generations").insert({
        property_type: propertyType,
        location,
        price_range: priceRange,
        features,
        tone,
        description: parsed.description,
        social_post: parsed.socialPost,
        hashtags: parsed.hashtags,
      })

      if (error) {
        // Non-fatal for API response; log for debugging
        // console.log("[v0] supabase insert error:", error.message)
      }
    } catch {
      // Supabase not connected or envs missing; continue without failing the API
      // console.log("[v0] supabase not configured; skipping insert")
    }

    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? "Unknown error" }, { status: 400 })
  }
}
