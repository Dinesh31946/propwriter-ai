// app/login/page.tsx

import { LoginForm } from '@/components/login-form'
import { Metadata } from 'next'
import { Home } from 'lucide-react'
import Link from 'next/link';

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

export const metadata: Metadata = {
  title: 'Login | PropWrite.AI',
  description: 'Sign in to access unlimited property description generations.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 bg-muted/50">
      
      {/* Branding and Value Proposition (Added Above Form) */}
      <Link href="/" className="flex items-center gap-3">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center">
              <PropWriteLogo />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">PropWrite.AI</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Generate high-converting, localized property listings instantly.
          </p>
        </div>
      </Link>

      <LoginForm />
    </div>
  )
}