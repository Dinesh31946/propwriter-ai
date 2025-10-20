// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/app/page.tsx

"use client"

import PropWriteApp from "@/components/propwrite/propwrite-app"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Sparkles, LogIn, User, LayoutDashboard, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Separator } from "@/components/ui/separator"
// CRITICAL: Import the new role hook
import { useAdminRole } from "@/hooks/use-admin-role" 


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

export default function AppPage() {
    const { user, loading } = useAuth();
    const { isAdmin, roleLoading } = useAdminRole(); // Use the new hook
    const router = useRouter();
    
    // --- AUTH GUARD: If not logged in, redirect to login page ---
    if (!loading && !user) {
        router.push('/login');
        return null;
    }

    // Show loading state while fetching session OR role
    if (loading || roleLoading) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-muted/50">
                <Sparkles className="h-8 w-8 animate-pulse text-primary" />
            </div>
        );
    }
    // --- END AUTH GUARD ---

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
    }
    
    return (
        <div className="min-h-dvh flex flex-col">
            {/* --- GLOBAL NAV BAR --- */}
            <header className="border-b bg-background/90 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    
                    {/* Logo and Name */}
                    <Link href="/app" className="flex items-center gap-3">
                        <div className="inline-flex items-center justify-center">
                            <PropWriteLogo />
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-foreground flex flex-col">
                            PropWrite.AI
                            <p className="text-xs text-muted-foreground hidden sm:block">Listing Generator App</p>
                        </span>
                    </Link>

                    {/* Auth and Admin Links */}
                    <nav className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                            <Link href="/pricing">Pricing</Link>
                        </Button>
                        
                        {/* Logged In User Links */}
                        <div className="flex items-center gap-3">
                            {/* Admin Button (CONDITIONAL RENDERING based on role hook) */}
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
                                Welcome, {user?.email?.split('@')[0]}
                            </span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <User className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>
            
            {/* --- MAIN CONTENT: PROPWRITE APP --- */}
            <main className="flex-1">
                <PropWriteApp /> 
            </main>
        </div>
    )
}