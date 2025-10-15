import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get("q")?.trim() ?? ""
    const limit = Number(url.searchParams.get("limit") ?? "20")
    const offset = Number(url.searchParams.get("offset") ?? "0")

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies,
      headers,
    })

    let query = supabase
      .from("generations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (q) {
      // simple ilike filter on location and features
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
