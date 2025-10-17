// components/login-form.tsx

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MailIcon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './auth-provider'
import { Separator } from '@/components/ui/separator'

type View = 'login' | 'signup' | 'magic_link_sent'

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [view, setView] = React.useState<View>('login')

  // Redirect if already logged in 
  React.useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])
  
  if (user) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // Determine which flow to execute: Magic Link (if password field is empty) or Password
    if (!password) {
        await handleMagicLink();
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(`Login Failed: ${error.message}`)
    } else {
      setMessage('Login successful! Redirecting...')
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`, 
      }
    })

    if (error) {
      setMessage(`Sign Up Failed: ${error.message}`)
    } else {
      setMessage('Success! Check your email for a confirmation link to complete sign up.')
      setView('login');
    }
    setLoading(false)
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setMessage('Sending link...')
    
    const { error } = await supabase.auth.signInWithOtp({ 
        email, 
        options: {
            emailRedirectTo: `${window.location.origin}/callback` 
        }
    })

    if (error) {
      setMessage(`Error sending link: ${error.message}`)
    } else {
      setMessage('Success! Check your email for the magic login link.')
      setView('magic_link_sent');
    }
    setLoading(false)
  }

  const socialLogin = async (provider: 'google') => {
    setLoading(true)
    setMessage('Redirecting...')
    
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/callback`, 
        }
    })

    if (error) {
        setMessage(`Social Login Failed: ${error.message}`);
        setLoading(false);
    }
  }

  const isSignUpView = view === 'signup';
  const headerTitle = isSignUpView ? 'Join PropWrite.AI' : 'Welcome Back';
  const headerDescription = isSignUpView 
    ? 'Unlock your 5 free generations daily — no credit card needed.'
    : 'Login to resume high-quality generation.';

  // FINAL FIX: Use a simple logo image/SVG and focus on clean alignment
//   const GoogleIcon = () => (
//     <svg 
//       xmlns="http://www.w3.org/2000/svg" 
//       viewBox="0 0 24 24" 
//       className="w-5 h-5 mr-3" 
//       fill="none" 
//     >
//       <path 
//         d="M21.2 11.1H12V13h6.3c-.2 1.3-1 2.3-2.5 3.1-.3.2-.7.4-1.1.5l2 2.3c1.9-1.5 3.1-3.9 3.1-6.1V11.1z" 
//         fill="#4285F4" 
//       />
//       <path 
//         d="M12 21.8c-3.1 0-5.7-1.4-7.6-3.8l2.5-2c1.3 1.3 3.1 2.1 5.1 2.1 2.5 0 4.6-1.5 5.5-3.8h3.1c-1 3.5-4.5 6.5-8.6 6.5z" 
//         fill="#34A853" 
//       />
//       <path 
//         d="M4.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8l-2.5-2c-.5 1-.8 2.2-.8 3.8s.3 2.8.8 3.8l2.5-2z" 
//         fill="#FBBC05" 
//       />
//       <path 
//         d="M12 4.2c1.7 0 3.3.7 4.5 1.8l2.8-2.8C17.7 2 15 1.1 12 1.1c-4.1 0-7.6 3-8.6 6.5l2.5 2c1-1.3 2.6-2.3 4.1-2.3z" 
//         fill="#EA4335" 
//       />
//     </svg>
//   );
  const GoogleIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-5 h-5 mr-3"
        aria-hidden="true"
        focusable="false"
    >
        <path fill="#4285F4" d="M24 9.5c3.8 0 6.4 1.6 7.9 3l5.8-5.8C33.4 3 29.1 1 24 1 14.6 1 6.8 6.7 3.5 14.8l6.8 5.3C12 12.7 17.4 9.5 24 9.5z" />
        <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.5c-.3 2.1-1.6 5.3-4.6 7.5l7.1 5.4c4.2-3.9 7.1-9.6 7.1-16.8z" />
        <path fill="#FBBC05" d="M10.3 28.7A14.4 14.4 0 0 1 9.4 24c0-1.6.3-3.1.8-4.7l-6.9-5.3C1.1 16.6 0 20.1 0 24c0 3.9 1.1 7.4 3.3 10.1l7-5.4z" />
        <path fill="#EA4335" d="M24 48c6.5 0 12-2.2 16-6.1l-7.1-5.4c-2 1.4-4.6 2.3-8.9 2.3-6.6 0-12-4.4-14-10.6l-7 5.4C6.8 41.3 14.6 48 24 48z" />
    </svg>
    );

  return (
    <Card className="mx-auto w-full max-w-sm border shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold">
          {headerTitle}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
            {headerDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Social Login Buttons */}
        <div className="grid gap-4">
          {/* <Button 
            variant="outline" 
            size="lg"
            onClick={() => socialLogin('google')}
            disabled={loading || view === 'magic_link_sent'}
            className="w-full justify-center transition-colors shadow-sm text-base hover:bg-muted/70"
          >
            <GoogleIcon />
            {isSignUpView ? 'Sign up with Google' : 'Sign in with Google'}
          </Button> */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => socialLogin('google')}
            disabled={loading || view === 'magic_link_sent'}
            className="w-full justify-center transition-colors shadow-sm text-base hover:bg-muted/70 flex items-center"
            >
            <GoogleIcon />
            {isSignUpView ? 'Sign up with Google' : 'Sign in with Google'}
           </Button>
          
          {/* Dynamic Separator Text Fix - Ensure the text sits correctly on the line */}
          <div className="flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-xs uppercase text-muted-foreground font-medium">
              {isSignUpView ? 'OR USE EMAIL' : 'OR CONTINUE WITH'}
            </span>
            <Separator className="flex-1" />
          </div>
        </div>

        {/* Email/Password/MagicLink Form */}
        <form onSubmit={isSignUpView ? handleSignUp : handleLogin} className="grid gap-4 mt-2">
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="agent@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="text-base"
            />
          </div>

          {/* Show Password ONLY for Signup view */}
          {isSignUpView && (
            <div className="grid gap-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                id="password"
                type="password"
                required
                placeholder="Secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                />
            </div>
          )}

          
          {/* Display Messages */}
          {message && <p className={`text-sm text-center ${message.includes('Success') ? 'text-green-600' : 'text-destructive'}`}>{message}</p>}

          {/* Primary Submit Button */}
          <Button 
            type="submit" 
            size="lg"
            className="w-full shadow-md hover:shadow-lg transition-shadow" 
            disabled={loading || !email || (isSignUpView && !password)}
          >
            {loading ? 'Processing...' : (isSignUpView ? 'Sign Up' : 'Log In')}
          </Button>
          
          {/* Magic Link Option for Login/Sent View (The Passwordless option) */}
          {!isSignUpView && (
            <Button 
                type="button" 
                variant="ghost"
                className="w-full text-sm text-primary hover:bg-primary/5 transition-colors"
                onClick={handleMagicLink}
                disabled={loading || !email || view === 'magic_link_sent'}
            >
                <MailIcon className='size-4 mr-2' />
                {view === 'magic_link_sent' ? 'Magic Link Sent! Check Email' : 'Or, Get Passwordless Sign-In Link'}
            </Button>
          )}

        </form>

        {/* Toggle View */}
        <div className="mt-6 text-center text-sm">
          {isSignUpView ? (
            <>
              Already a user?{' '}
              <button 
                type="button" 
                className="underline font-medium text-primary hover:text-primary/80" 
                onClick={() => {setView('login'); setMessage(''); setPassword('')}}
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button 
                type="button" 
                className="underline font-medium text-primary hover:text-primary/80" 
                onClick={() => {setView('signup'); setMessage(''); setPassword('')}}
              >
                Sign up now
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}