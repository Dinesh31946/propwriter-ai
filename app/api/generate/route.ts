// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/api/generate/route.ts

import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerClient, type CookieOptions } from "@supabase/ssr" 
import { cookies } from "next/headers"

// --- FINAL TYPE DEFINITION (Explicit Listing Type, Conditional Price) ---
type GenerateBody = {
  propertyType: string
  listingType: 'Sale' | 'Rent' | 'Lease' // Explicitly selected by user
  locality?: string
  cityState?: string
  features?: string
  tone?: string
  bedrooms?: string
  bathrooms?: string
  area?: string
  projectName?: string
  keyLandmarks?: string
  // CONDITIONAL PRICE FIELDS
  salePriceRange?: string // Only used if listingType is Sale
  rentMonthly?: string     // Only used if listingType is Rent/Lease
  rentDeposit?: string     // Only used if listingType is Rent/Lease
}

type ParsedOutput = {
  description: string
  socialPost: string
  hashtags: string[]
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody

    const {
      propertyType = "Apartment",
      listingType = "Sale", // Explicitly used
      locality = "",
      cityState = "",
      features = "",
      tone = "Professional",
      bedrooms = "",
      bathrooms = "",
      area = "",
      projectName = "",
      keyLandmarks = "",
      salePriceRange = "",
      rentMonthly = "",
      rentDeposit = "",
    } = body

    // 1. CONDITIONAL PRICE/TERM VARIABLE FOR PROMPT
    const priceContext = 
      listingType === 'Sale'
        ? `Sale Price Range: ${salePriceRange || "Unlisted"}`
        : `Monthly Rent: ₹${rentMonthly || 'Unspecified'}, Deposit/Terms: ${rentDeposit || 'Unspecified'}`;

    // --- FINAL ADVANCED PROMPT STRUCTURE ---
    const prompt = [
      "You are PropWrite, a highly experienced and professional real estate copywriter. Your task is to craft compelling marketing content in strict JSON format.",
      
      "Return strictly valid JSON with keys: description (string), socialPost (string), hashtags (array of 8-12 short strings).",
      "The description must be **300-450 words** and follow a clear marketing flow (Hook > Key Features > Lifestyle/Location > Call to Action).",
      `The content must be optimized for a **${listingType.toUpperCase()}** transaction. If it's for 'Rent' or 'Lease', focus on monthly costs, deposit, and immediate occupancy. If it's for 'Sale', focus on investment, appreciation, and ownership benefits.`,
      "The socialPost must be concise, engaging, and include a Call to Action (max 40 words). Hashtags must be single words prefixed with '#'.",
      "",
      "--- INPUT DATA AND CONSTRAINTS ---",
      `1. Transaction Type: ${listingType}`,
      `2. Property Type: ${propertyType}`,
      `3. Project/Building: ${projectName || "Unspecified"}`,
      `4. Location: ${locality} in ${cityState}`,
      `5. ${priceContext}`, // Use the conditional variable
      `6. Specifications: ${bedrooms} Bedrooms, ${bathrooms} Bathrooms, ${area || "Unknown Area"}`,
      `7. Key Features: ${features}`,
      `8. Proximity/Landmarks: ${keyLandmarks || "None provided. Do not invent landmarks."}`,
      `9. Target Tone: ${tone}`,
      "",
      "CONSTRAINTS:",
      "A. The generated content must strictly match the Target Tone and Transaction Type.",
      "B. DO NOT invent or mention any feature, amenity, or detail not explicitly listed in 'Key Features' or 'Proximity/Landmarks'.",
      "C. Highlight the neighborhood and proximity points in the description.",
      "D. Ensure the description uses professional, high-converting language appropriate for the Indian market.",
      "",
      "Output only JSON. No markdown, no fences.",
    ].filter(Boolean).join("\n")

    // AI GENERATION AND PARSING LOGIC
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    })

    let parsed: ParsedOutput 
    try {
      parsed = JSON.parse(text)
    } catch {
      // Fallback in case the model returns invalid JSON
      parsed = {
        description: `Failed to generate a high-quality description. Re-running the prompt with the specified tone: ${tone}. Property type: ${propertyType}, location: ${locality}, ${cityState}. Price context: ${priceContext}.`,
        socialPost: `New Listing Alert in ${locality}! Ready for the market.`,
        hashtags: ["#RealEstate", "#NewListing", "#PropTech"],
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

      // 2. CONDITIONAL DATABASE INSERT
      // We save the full price context (which includes Sale Range OR Rent details) into the price_range column
      const dbPriceRange = priceContext.replace(/Sale Price Range: |Monthly Rent: /, '').trim();

      const { error } = await supabase.from("generations").insert({
        property_type: propertyType,
        listing_type: listingType, // SAVE EXPLICIT USER CHOICE
        location: `${locality} in ${cityState}`, 
        price_range: dbPriceRange, // Storing the final price context here
        features,
        tone,
        description: parsed.description,
        social_post: parsed.socialPost,
        hashtags: parsed.hashtags,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        area_sqft_sqm: area,
        project_name: projectName,
        key_landmarks: keyLandmarks,
        // user_id will be added in the next phase
      });

      if (error) {
        console.error("[v0] Supabase insert error:", error.message);
      }
    } catch (err) {
      console.error("[v0] Supabase not configured or insert failed:", err);
    }

    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? "Unknown error" }, { status: 400 })
  }
}