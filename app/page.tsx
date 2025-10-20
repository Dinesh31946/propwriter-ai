// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/page.tsx

"use client"

import PropWriteApp from "@/components/propwrite/propwrite-app"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// Assume useAuth and createClient were implemented in previous steps
import { useAuth } from "@/components/auth-provider" 
import { createClient } from "@/lib/supabase/client"
import { LogIn, User, Home, LayoutDashboard, Sparkles } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// --- NEW REUSABLE LOGO COMPONENT ---
function PropWriteLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Base Icon: Home (Property) */}
      <img
        src="/PropWriter-Icon.png"  // 👉 Replace with your PNG path (e.g. /assets/logo.png)
        alt="PropWrite Logo"
        className="h-16 w-16 object-contain"
      />
    </div>
  );
}

// NOTE: Add this to your .env.local for admin check
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@propwrite.ai" 

export default function Page() {
  const { user, loading } = useAuth()
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }
  
  // Check if the current user is the admin (for button display only)
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-dvh flex flex-col">
      {/* --- GLOBAL NAV BAR --- */}
      <header className="border-b bg-background/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo and Name */}
          <Link href="/" className="flex items-center">
            <div className="inline-flex items-center justify-center">
              <PropWriteLogo />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              PropWrite.AI
              <p className="text-xs text-muted-foreground">Turn property details into professional listings instantly.</p>
            </span>
          </Link>

          {/* Auth and Admin Links */}
          <nav className="flex items-center gap-2">
            
            {/* NEW: Pricing Link (for all users) */}
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/pricing">Pricing</Link>
            </Button>

            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              // ... Logged In User Links ...
              <div className="flex items-center gap-3">
                {/* Admin Button (Visible only to the Admin Email) */}
                {isAdmin && (
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/admin">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
                
                <Separator orientation="vertical" className="h-5 hidden sm:block" />
                
                {/* User Info and Logout */}
                <span className="text-sm text-muted-foreground hidden lg:block">
                  {user.email?.split('@')[0]}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <User className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              // ... Logged Out Links ...
              <Button asChild size="sm">
                <Link href="/login" className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign Up / Login
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1">
        {/* The main generation app component (remove its internal header) */}
        <PropWriteApp /> 
      </main>
    </div>
  )
}