// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/api/admin/generations/route.ts

import { NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr" 
import { cookies, headers } from "next/headers"

// NOTE: ADMIN_EMAIL is now only used for INITIAL SETUP, but we keep it defined.
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@propwrite.ai" 

export async function GET(req: Request) {
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

    // --- ADMIN AUTHORIZATION CHECK (Using Role-Based Access) ---
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Block if not logged in
        return NextResponse.json({ error: "Access Denied: Must be logged in." }, { status: 403 })
    }

    // CRITICAL: Fetch the user's role from the new table
    const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
    
    // Fallback: If no role is found, or role is not 'admin', deny access
    if (roleError || roleData?.role !== 'admin') {
        return NextResponse.json({ error: "Access Denied: User is not authorized as Admin." }, { status: 403 })
    }
    // --- END ADMIN CHECK ---
    

    // --- Monitoring Logic (Only runs for authenticated Admin) ---
    const { data, error } = await supabase
      .rpc('get_user_generation_counts')
      .select('*'); 
      
    if (error) {
        console.error("Admin Dashboard Aggregation Error:", error);
        return NextResponse.json({ error: "Failed to fetch user usage summary from database function." }, { status: 400 })
    }

    // Filter out anonymous users for visualization
    const items = data.filter((item: { user_uuid: null; }) => item.user_uuid !== null);
    const anonymousEntry = data.find((item: { user_uuid: null; }) => item.user_uuid === null);

    // Return the aggregated list.
    return NextResponse.json({ 
        items: items ?? [], 
        count: items.length, 
        anonymousCount: anonymousEntry?.total_generations ?? 0
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? "Unknown error" }, { status: 400 })
  }
}