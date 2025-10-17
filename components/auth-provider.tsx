// components/auth-provider.tsx

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client' // The client helper we just created

// Define the context shape
interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook for consuming the context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // This error should guide developers to wrap components correctly
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Provider Component
export default function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: Session | null
  children: React.ReactNode
}) {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(initialSession)
  const [user, setUser] = useState<User | null>(initialSession?.user || null)
  const [loading, setLoading] = useState(false)

  // This effect listens for Supabase Auth state changes (login, logout, token refresh)
  useEffect(() => {
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user || null)
      }
    )
    
    // Initialize state using server-passed data
    setSession(initialSession);
    setUser(initialSession?.user || null);
    setLoading(false);


    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, initialSession])

  const contextValue = {
    session,
    user,
    loading,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}