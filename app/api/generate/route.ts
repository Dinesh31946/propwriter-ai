// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/api/generate/route.ts

import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerClient, type CookieOptions } from "@supabase/ssr" 
import { cookies } from "next/headers"

const MAX_FREE_GENERATIONS = 5; 

// --- FINAL TYPE DEFINITION ---
type GenerateBody = {
  propertyType: string
  listingType: 'Sale' | 'Rent' | 'Lease' 
  locality?: string
  cityState?: string
  features?: string 
  tone?: string
  bedrooms?: string
  bathrooms?: string
  area?: string
  projectName?: string
  salePriceExpectation?: string 
  rentMonthly?: string     
  rentDeposit?: string     
  reraNumber?: string
  possessionDate?: string
}

type ParsedOutput = {
  // NEW: Title field
  title: string
  description: string
  socialPost: string
  hashtags: string[]
  metaDescription: string
}

export async function POST(req: Request) {
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

  try {
    const body = (await req.json()) as GenerateBody

    const {
      propertyType = "Apartment",
      listingType = "Sale",
      locality = "",
      cityState = "",
      features = "", 
      tone = "Professional (English)",
      bedrooms = "",
      bathrooms = "",
      area = "",
      projectName = "",
      salePriceExpectation = "",
      rentMonthly = "",
      rentDeposit = "",
      reraNumber = "",
      possessionDate = "",
    } = body
    
    // --- RATE LIMITING LOGIC (Using external data to prevent errors) ---
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let countQuery = supabase
        .from("generations")
        .select("id", { count: "exact" })
        .gte('created_at', twentyFourHoursAgo);

    if (userId) {
        countQuery = countQuery.eq('user_id', userId);
    } else {
        countQuery = countQuery.is('user_id', null);
    }

    const { count: fetchedCount, error: countError } = await countQuery;
    
    if (countError) {
        console.error("Supabase rate limit count query failed:", countError.message);
        return NextResponse.json({ error: "Rate limit check failed due to database error. Please try again." }, { status: 500 });
    }

    const currentCount = fetchedCount ?? 0;

    if (currentCount >= MAX_FREE_GENERATIONS) {
        let upgradeMessage = userId 
            ? "Your free daily limit has been reached. Upgrade to PropWrite Pro for unlimited generations!"
            : "Daily limit reached. Please sign up or login to continue generating.";
            
        return NextResponse.json({ error: upgradeMessage }, { status: 403 });
    }
    // --- END RATE LIMITING LOGIC ---

    // CONDITIONAL PRICE/TERM VARIABLE FOR PROMPT
    const priceContext = 
      listingType === 'Sale'
        ? `Sale Price: ${salePriceExpectation || "Unlisted"}`
        : `Monthly Rent: ₹${rentMonthly || 'Unspecified'}, Deposit/Terms: ${rentDeposit || 'Unspecified'}`;
        
    // LOCALIZATION PROMPT INSTRUCTIONS
    const localizationInstruction = (() => {
        if (tone === "Casual (Hinglish Blend)") {
            return "Crucial: Write the copy in a natural, friendly Hinglish blend (seamlessly mixing Hindi/Marathi phrases with English). This must feel local and conversational."
        }
        if (tone === "Regional - Marathi/Local") {
            return "Crucial: Write the description's primary language as Marathi, ensuring all professional real estate terms remain correct and formal, but the narrative flows in Marathi."
        }
        return "Write all content in high-quality, fluent English."
    })();

    // --- FINAL ADVANCED PROMPT STRUCTURE with TITLE GENERATION ---
    const prompt = [
      "You are PropWrite, a highly experienced and professional real estate copywriter. Your task is to craft compelling marketing content in strict JSON format.",
      
      // CRITICAL UPDATE: Instruct to generate title
      "Return strictly valid JSON with keys: **title** (string, max 10 words, highly compelling), description (string), socialPost (string), hashtags: string[], and metaDescription (string, max 160 characters for SEO).",
      
      "The description must be **300-450 words** and follow a clear marketing flow.",
      `The content must be optimized for a **${listingType.toUpperCase()}** transaction.`,
      "The socialPost must be concise, engaging, and include a Call to Action (max 40 words). Hashtags must be single words prefixed with '#'.",
      
      "--- INPUT DATA AND CONSTRAINTS ---",
      `1. Transaction Type: ${listingType}`,
      `2. Property Type: ${propertyType}`,
      `3. Project/Building: ${projectName || "Unspecified"}`,
      `4. Location: ${locality} in ${cityState}`,
      `5. ${priceContext}`,
      `6. Specifications: ${bedrooms} Bedrooms, ${bathrooms} Bathrooms, ${area || "Unknown Area"}`,
      `7. RERA Number: ${reraNumber || "Not Provided"}`,
      `8. Possession Date: ${possessionDate || "Not Provided"}`,
      `9. Raw Property Summary (Amenities, Proximity, SEO Keywords): ${features}`, 
      `10. Target Tone: ${tone}`,
      "",
      "CRITICAL CONSTRAINTS:",
      localizationInstruction, 
      `A. The generated copy MUST NOT contradict the Specifications.`, 
      "B. Use the 'Raw Property Summary' to identify Key Features, Proximity, and necessary SEO Keywords. Weave all found keywords seamlessly into the 'description'.",
      "C. If RERA Number or Possession Date is provided, ensure they are included in the 'description' in a trustworthy manner.",
      "D. DO NOT invent details or amenities not explicitly present in the inputs.",
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
      parsed = {
        title: `Premium ${propertyType} in ${locality}`, // Default title
        description: `Failed to generate a complete description. Please ensure your inputs are clear and try regenerating.`,
        socialPost: `New Listing Alert!`,
        hashtags: ["#RealEstate", "#PropTech"],
        metaDescription: `Premium property listing generated by PropWriter.AI.`,
      }
    }
    
    // Persist generation in Supabase
    try {
      // CONDITIONAL DATABASE INSERT
      const dbPriceRange = priceContext.replace(/Sale Price: |Monthly Rent: /, '').trim();

      const { error } = await supabase.from("generations").insert({
        property_type: propertyType,
        listing_type: listingType,
        location: `${locality} in ${cityState}`, 
        price_range: dbPriceRange,
        features: features, 
        tone,
        description: parsed.description,
        social_post: parsed.socialPost,
        hashtags: parsed.hashtags,
        // NEW: Save the title to the description row (optional, for later database flexibility)
        // We will repurpose the 'project_name' column or 'description' based on future DB needs. For now, let's keep it clean:
        // Note: The database is missing a dedicated title column, so we skip saving it for now to avoid breaking the DB insert.
        // It's still generated and returned to the user.
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        area_sqft_sqm: area,
        project_name: projectName,
        rera_number: reraNumber,
        possession_date: possessionDate,
        meta_description: parsed.metaDescription, 
        user_id: userId,
      });

      if (error) {
        console.error("[v0] Supabase insert error:", error.message);
      }
    } catch (err) {
      console.error("[v0] Supabase error during insert:", err);
    }

    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? "Unknown error" }, { status: 400 })
  }
}