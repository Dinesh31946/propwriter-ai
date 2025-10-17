// lib/supabase/client.ts

'use client'
import { createBrowserClient } from '@supabase/ssr'

// Function to create a client-side Supabase instance
export function createClient() {
  // Uses the public environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}