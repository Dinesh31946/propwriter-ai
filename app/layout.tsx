// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/layout.tsx

import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
// NEW IMPORTS
import AuthProvider from '@/components/auth-provider'
import { createServerClient } from "@supabase/ssr" 
import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'


export const metadata: Metadata = {
  title: 'PropWriter.AI', 
  description: 'Turn property details into professional listings instantly.', 
  generator: 'v0.app',
}


// Function to get initial session (server-side fetch for SSR)
async function getInitialSession() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        // CRITICAL FIX: set and remove must be NO-OP functions in the layout (Server Component)
        set: (name: string, value: string, options: CookieOptions) => {}, 
        remove: (name: string, options: CookieOptions) => {},
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch session data on the server
  const session = await getInitialSession();

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* Wrap content with AuthProvider to share session context */}
        <AuthProvider initialSession={session}>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}