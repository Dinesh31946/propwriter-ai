// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/api/generate/route.ts

import { NextResponse } from "next/server"
import { generateText } from "ai"
// --- NEW IMPORT ---
import { openai } from "@ai-sdk/openai" 
// ------------------
import { createServerClient, type CookieOptions } from "@supabase/ssr" 
import { cookies } from "next/headers"

// Simple schema/type for request payload
type GenerateBody = {
  propertyType: string
  location?: string
  priceRange?: string
  features?: string
  tone?: string
  bedrooms?: string
  bathrooms?: string
  area?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody

    const {
      propertyType = "Apartment",
      location = "",
      priceRange = "",
      features = "",
      tone = "Professional",
      // Destructure new fields
      bedrooms = "",
      bathrooms = "",
      area = "",
    } = body

    const prompt = [
      "You are PropWrite, an assistant that crafts real estate listing content.",
      "Return strictly valid JSON with keys: description (string), socialPost (string), hashtags (array of 8-12 short strings).",
      "The description should be **300-450 words**, polished and professional.",
      "The socialPost should be concise and engaging (max ~40 words).",
      "Hashtags must be single words prefixed with '#'.",
      "",
      `Inputs:`,
      `- Property type: ${propertyType}`,
      `- Location: ${location || "N/A"}`,
      `- Price range: ${priceRange || "N/A"}`,
      `- Key Features/Amenities: ${features || "N/A"}`,
      `- Tone: ${tone}`,
      `${bedrooms ? `- Bedrooms: ${bedrooms}` : ""}`,
      `${bathrooms ? `- Bathrooms: ${bathrooms}` : ""}`,
      `${area ? `- Area: ${area}` : ""}`,
      "",
      "Output only JSON. No markdown, no fences.",
    ].filter(Boolean).join("\n")

    // AI GENERATION AND PARSING LOGIC
    const { text } = await generateText({
      // --- FIX: PASS THE OPENAI PROVIDER AND MODEL ---
      model: openai("gpt-4o-mini"), // Using gpt-4o-mini for cost efficiency
      // model: openai("gpt-5-mini"), // Use this line if you specifically require gpt-5-mini
      // ------------------------------------------------
      prompt,
    })

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
    
    // Persist generation in Supabase
    try {
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name: string) => cookieStore.get(name)?.value,
            set: (name: string, value: string, options: CookieOptions) => {
              cookieStore.set({ name, value, ...options })
            },
            remove: (name: string, options: CookieOptions) => {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      );

      const { error } = await supabase.from("generations").insert({
        property_type: propertyType,
        location,
        price_range: priceRange,
        features,
        tone,
        description: parsed.description,
        social_post: parsed.socialPost,
        hashtags: parsed.hashtags,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        area_sqft_sqm: area,
      });

      if (error) {
        console.error("[v0] Supabase insert error:", error.message);
      }
    } catch (err) {
      console.error("[v0] Supabase not configured; skipping insert", err);
    }

    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? "Unknown error" }, { status: 400 })
  }
}