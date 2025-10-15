"use client"

import { useMemo, useState } from "react"
import { Home, PenLine, Sparkles, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

type PriceRange = "< ₹50L" | "₹50L–₹1Cr" | "₹1Cr–₹3Cr" | "₹3Cr+"

type Tone = "Professional" | "Luxury" | "Casual" | "Investor-focused"

export default function PropWriteApp() {
  // Form state
  const [propertyType, setPropertyType] = useState("Apartment")
  const [location, setLocation] = useState("")
  const [priceRange, setPriceRange] = useState<PriceRange | "">("")
  const [features, setFeatures] = useState("")
  const [tone, setTone] = useState<Tone>("Professional")

  // Result/UX state
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState("")
  const [socialPost, setSocialPost] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])

  const wordsCount = useMemo(() => {
    const trimmed = features.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }, [features])

  async function handleGenerate() {
    setLoading(true)
    setDescription("")
    setSocialPost("")
    setHashtags([])

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType,
          location,
          priceRange,
          features,
          tone,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to generate content")
      }

      const data: {
        description: string
        socialPost: string
        hashtags: string[]
      } = await res.json()

      setDescription(data.description)
      setSocialPost(data.socialPost)
      setHashtags(data.hashtags)
    } catch (err) {
      // Optionally show a toast; for MVP we just no-op
      // console.log("[v0] generate error:", (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // no-op for MVP
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">PropWrite.AI</h1>
            <p className="text-sm text-muted-foreground">Turn property details into professional listings instantly.</p>
          </div>
        </div>
      </header>

      {/* Layout */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: Input Form */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" aria-hidden="true" />
              Property Details
            </CardTitle>
            <CardDescription>Enter your listing information and generate a polished description.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Property Type */}
              <div className="grid gap-2">
                <Label htmlFor="property-type">Property Type</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger id="property-type" aria-label="Property Type">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Commercial Space">Commercial Space</SelectItem>
                      <SelectItem value="Plot/Land">Plot/Land</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Neighborhood, City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Price Range */}
              <div className="grid gap-2">
                <Label htmlFor="price-range">Price Range</Label>
                <Select value={priceRange} onValueChange={(v: PriceRange) => setPriceRange(v)}>
                  <SelectTrigger id="price-range" aria-label="Price Range">
                    <SelectValue placeholder="Select a price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="< ₹50L">{"< ₹50L"}</SelectItem>
                      <SelectItem value="₹50L–₹1Cr">₹50L–₹1Cr</SelectItem>
                      <SelectItem value="₹1Cr–₹3Cr">₹1Cr–₹3Cr</SelectItem>
                      <SelectItem value="₹3Cr+">₹3Cr+</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Features & Amenities */}
              <div className="grid gap-2">
                <Label htmlFor="features">Key Features & Amenities</Label>
                <Textarea
                  id="features"
                  placeholder="E.g., 3 BHK, spacious living, modular kitchen, balcony, covered parking, near metro, clubhouse, pool..."
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows={6}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="sr-only">Word count</span>
                  <span aria-hidden="true">{wordsCount} words</span>
                  <span>Tip: List highlights in short phrases.</span>
                </div>
              </div>

              {/* Tone */}
              <div className="grid gap-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(v: Tone) => setTone(v)}>
                  <SelectTrigger id="tone" aria-label="Tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Investor-focused">Investor-focused</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Action */}
              <div className="pt-2">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={loading}
                  aria-disabled={loading}
                >
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                  {loading ? "Generating..." : "Generate Description"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Output Panel */}
        <div className="flex flex-col gap-6">
          {/* Listing Description */}
          <Card className="border shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Listing Description</CardTitle>
                <CardDescription>Polished, ready-to-use description.</CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(description)}
                disabled={!description || loading}
                aria-disabled={!description || loading}
              >
                <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                Copy Text
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[88%]" />
                  <Skeleton className="h-4 w-[94%]" />
                  <Skeleton className="h-4 w-[76%]" />
                  <Skeleton className="h-4 w-[65%]" />
                </div>
              ) : description ? (
                <Textarea value={description} readOnly rows={8} className="resize-none" />
              ) : (
                <p className="text-sm text-muted-foreground">Your generated description will appear here.</p>
              )}
            </CardContent>
          </Card>

          {/* Social Post */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Social Post</CardTitle>
                <CardDescription>Optimized for quick sharing.</CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(socialPost)}
                disabled={!socialPost || loading}
                aria-disabled={!socialPost || loading}
              >
                <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                Copy Post
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              ) : socialPost ? (
                <Textarea value={socialPost} readOnly rows={4} className="resize-none" />
              ) : (
                <p className="text-sm text-muted-foreground">Your share-ready social caption will appear here.</p>
              )}
            </CardContent>
          </Card>

          {/* Hashtags + Upsell */}
          <Card>
            <CardHeader>
              <CardTitle>Hashtags</CardTitle>
              <CardDescription>Use relevant tags to boost reach.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              ) : hashtags.length ? (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Suggested hashtags will appear here.</p>
              )}

              <Separator className="my-6" />

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Want multiple variations and styles?</p>
                <Button variant="secondary">Regenerate (Upgrade to Pro)</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
