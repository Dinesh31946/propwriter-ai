// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/page.tsx

"use client"

import PropWriteApp from "@/components/propwrite/propwrite-app"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider" 
import { createClient } from "@/lib/supabase/client"
import { LogIn, User, Home, LayoutDashboard, Sparkles } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import LandingPage from "@/components/landing-page" // Your custom landing page
import { useEffect } from "react"
import { useRouter } from "next/navigation" // Import useRouter

// Logo component (remains the same)
function PropWriteLogo() {
  return (
    <div className="relative flex items-center justify-center">
      <img
        src="/PropWriter-Icon.png" 
        alt="PropWrite Logo"
        className="h-16 w-16 object-contain"
      />
    </div>
  );
}

// NOTE: Add this to your .env.local for admin check
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@propwriter.ai" 

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter(); // Initialize router
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }
  
  // Check if the current user is the admin (for button display only)
  const isAdmin = user?.email === ADMIN_EMAIL;

  // --- REDIRECT GUARD LOGIC ---
  useEffect(() => {
    if (!loading && user) {
        // If user is logged in, redirect them to the App view
        router.push('/app');
    }
  }, [user, loading, router]);

  // If loading or logged in, return null/loading state to prevent flicker
  if (loading || user) {
    return (
        <div className="min-h-dvh flex items-center justify-center bg-muted/50">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
        </div>
    );
  }
  // --- END REDIRECT GUARD LOGIC ---


  return (
    <div className="min-h-dvh flex flex-col">
      {/* --- GLOBAL NAV BAR (Now a client component) --- */}
      <header className="border-b bg-background/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo and Name */}
          <Link href="/" className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center">
              <PropWriteLogo />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground flex flex-col">
              PropWriter.AI
              <p className="text-xs text-muted-foreground hidden sm:block">Turn property details into professional listings instantly.</p>
            </span>
          </Link>

          {/* Auth Links (Simplified for Landing Page) */}
          <nav className="flex items-center gap-2">
            
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/pricing">Pricing</Link>
            </Button>

            <Button asChild size="sm">
              <Link href="/login" className="inline-flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign Up / Login
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT: LANDING PAGE (Logged Out View) --- */}
      <main className="flex-1">
        <LandingPage/>
      </main>
    </div>
  )
}