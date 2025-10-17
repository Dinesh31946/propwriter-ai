// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/api/admin/generations/route.ts

import { NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr" 
import { cookies, headers } from "next/headers"

// Define the Admin Email (use a public var for serverless functions)
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@propwrite.ai" 

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get("q")?.trim() ?? ""
    const limit = Number(url.searchParams.get("limit") ?? "20")
    const offset = Number(url.searchParams.get("offset") ?? "0")

    const cookieStore = await cookies()
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

    // --- ADMIN AUTHORIZATION CHECK ---
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: "Access Denied: Not authorized to view admin data." }, { status: 403 })
    }
    // --- END ADMIN CHECK ---
    

    let query = supabase
      .from("generations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (q) {
      query = query.ilike("location", `%${q}%`).ilike("features", `%${q}%`)
    }

    const { data, error, count } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ items: data ?? [], count: count ?? 0 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? "Unknown error" }, { status: 400 })
  }
}