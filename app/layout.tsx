// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/layout.tsx

import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import AuthProvider from '@/components/auth-provider' // Your Auth Context Provider
import { createServerClient } from "@supabase/ssr" 
import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'


export const metadata: Metadata = {
  title: 'PropWrite.AI', 
  description: 'Turn property details into professional listings instantly.', 
  generator: 'v0.app',
}


// Function to get initial session (server-side fetch for SSR)
async function getInitialSession() {
  const cookieStore = await cookies()
  
  // Use the anonymous key here
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
  
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getInitialSession();

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider initialSession={session}>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}