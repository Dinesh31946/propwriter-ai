// app/login/page.tsx

import { LoginForm } from '@/components/login-form'
import { Metadata } from 'next'
import { Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Login | PropWrite.AI',
  description: 'Sign in to access unlimited property description generations.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 bg-muted/50">
      
      {/* Branding and Value Proposition (Added Above Form) */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg mb-3 animate-in fade-in zoom-in-50 duration-500">
            <Home className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">PropWrite.AI</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Generate high-converting, localized property listings instantly.
        </p>
      </div>

      <LoginForm />
    </div>
  )
}