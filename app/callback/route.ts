// app/callback/route.ts

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' is the path the user should be redirected to after successful login
  const next = searchParams.get('next') || '/' 

  if (code) {
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

    // Exchange the auth code for a user session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the intended page (home page /)
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to login page with an error if the process fails
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}