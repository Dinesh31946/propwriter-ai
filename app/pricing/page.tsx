// app/pricing/page.tsx (New file)

import Link from 'next/link'
import { Check, X, Zap, LayoutDashboard, Home, Badge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata = {
  title: 'Pricing | PropWrite.AI',
  description: 'Choose the best plan for unlimited, professional listing generation.',
}

const features = [
  { name: 'Generations per day', free: '5', pro: 'Unlimited', agency: 'Unlimited' },
  { name: 'Listing Title Generation', free: true, pro: true, agency: true },
  { name: 'Localized Tone (Hinglish/Marathi)', free: true, pro: true, agency: true },
  { name: 'SEO Meta Description', free: true, pro: true, agency: true },
  { name: 'Bulk CSV Upload (Phase 2)', free: false, pro: true, agency: true },
  { name: 'API Access (Phase 2)', free: false, pro: false, agency: true },
  { name: 'Team Seat Management (Phase 2)', free: false, pro: false, agency: true },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your listing volume and accelerate your conversion rates.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
        
        {/* FREE PLAN */}
        <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold mb-1">Free</CardTitle>
            <CardDescription className="text-lg">For Trial & Individual Listings</CardDescription>
            <div className="text-5xl font-extrabold mt-4">₹0</div>
          </CardHeader>
          <CardContent className="flex-1">
            <Button variant="outline" className="w-full text-base" disabled>
              Current Plan
            </Button>
            <Separator className="my-6" />
            <ul className="grid gap-4">
              {features.map((feature) => (
                <li key={feature.name} className="flex items-center gap-3">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? <Check className="size-5 text-green-500" /> : <X className="size-5 text-muted-foreground/50" />
                  ) : (
                    <Zap className="size-4 text-primary" />
                  )}
                  <span className="text-sm">{feature.name}: {typeof feature.free === 'string' ? feature.free : ''}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/" className="w-full">
                <Button variant="secondary" className="w-full">
                    Back to App
                </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* PRO PLAN (Monetization Target) */}
        <Card className="flex flex-col border-2 border-primary shadow-2xl transition-shadow scale-[1.03]">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold mb-1 flex items-center justify-center gap-2 text-primary">
                PropWrite Pro <Badge className="bg-primary hover:bg-primary">Best Value</Badge>
            </CardTitle>
            <CardDescription className="text-lg">For High-Volume Agents & Brokers</CardDescription>
            <div className="text-5xl font-extrabold mt-4">
                ₹1,499<span className="text-xl font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {/* NOTE: This button will trigger the Stripe/Razorpay checkout flow */}
            <Button className="w-full text-base bg-primary hover:bg-primary/90">
                Start Pro Plan
            </Button>
            <Separator className="my-6" />
            <ul className="grid gap-4">
              {features.map((feature) => (
                <li key={feature.name} className="flex items-center gap-3">
                  {feature.pro ? <Check className="size-5 text-green-500" /> : <X className="size-5 text-muted-foreground/50" />}
                  <span className="text-sm">{feature.name}: {typeof feature.pro === 'string' ? feature.pro : ''}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
             <p className="text-xs text-muted-foreground w-full text-center">Billed Annually: ₹14,999 (Save 16%)</p>
          </CardFooter>
        </Card>

        {/* AGENCY PLAN (Future Scale) */}
        <Card className="flex flex-col border-2 transition-shadow hover:shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold mb-1">Agency</CardTitle>
            <CardDescription className="text-lg">For Builders & Large Brokerages</CardDescription>
            <div className="text-5xl font-extrabold mt-4">
                Custom
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <Button variant="outline" className="w-full text-base">
                Contact Sales
            </Button>
            <Separator className="my-6" />
            <ul className="grid gap-4">
              {features.map((feature) => (
                <li key={feature.name} className="flex items-center gap-3">
                  {feature.agency ? <Check className="size-5 text-green-500" /> : <X className="size-5 text-muted-foreground/50" />}
                  <span className="text-sm">{feature.name}: {typeof feature.agency === 'string' ? feature.agency : ''}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
              <p className="text-xs text-muted-foreground w-full text-center">Includes dedicated onboarding support.</p>
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}