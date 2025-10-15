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

type ListingType = "Sale" | "Rent" | "Lease"

// Helper function to download text
function downloadText(content: string, filename: string) {
  const element = document.createElement("a")
  const file = new Blob([content], { type: "text/plain" })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export default function PropWriteApp() {
  // Form state
  const [propertyType, setPropertyType] = useState("Apartment")
  // EXPLICIT LISTING TYPE
  const [listingType, setListingType] = useState<ListingType>("Sale") 
  
  // Structured Location States
  const [locality, setLocality] = useState("") 
  const [cityState, setCityState] = useState("")
  
  // CONDITIONAL PRICE STATES
  const [salePriceRange, setSalePriceRange] = useState<PriceRange | "">("")
  const [rentMonthly, setRentMonthly] = useState("")
  const [rentDeposit, setRentDeposit] = useState("")
  
  const [features, setFeatures] = useState("")
  const [tone, setTone] = useState<Tone>("Professional")

  // States for Specs & New Landmarks/Project
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [area, setArea] = useState("") 
  const [projectName, setProjectName] = useState("")
  const [keyLandmarks, setKeyLandmarks] = useState("")

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
          listingType, // Pass EXPLICIT type
          locality,
          cityState,
          features,
          tone,
          bedrooms,
          bathrooms,
          area,
          projectName,
          keyLandmarks,
          // Pass ONLY the relevant price field
          salePriceRange: listingType === 'Sale' ? salePriceRange : undefined,
          rentMonthly: listingType !== 'Sale' ? rentMonthly : undefined,
          rentDeposit: listingType !== 'Sale' ? rentDeposit : undefined,
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
      {/* Header (no change) */}
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
              
              {/* NEW: LISTING TYPE (Explicitly Selected) */}
              <div className="grid gap-2">
                <Label htmlFor="listing-type">Listing Type</Label>
                <Select value={listingType} onValueChange={(v: ListingType) => setListingType(v)}>
                  <SelectTrigger id="listing-type" aria-label="Listing Type">
                    <SelectValue placeholder="Select Sale or Rent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Sale">For Sale</SelectItem>
                      <SelectItem value="Rent">For Rent</SelectItem>
                      <SelectItem value="Lease">For Lease</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type (Remains) */}
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

              {/* Bedrooms & Bathrooms (Remains) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="e.g., 3"
                    min="1"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="e.g., 2"
                    min="1"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                  />
                </div>
              </div>

              {/* Area (Remains) */}
              <div className="grid gap-2">
                <Label htmlFor="area">Area (sq.ft / sq.m)</Label>
                <Input
                  id="area"
                  placeholder="e.g., 1500 sq.ft or 140 sq.m"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>

              {/* Locality/Area (Remains) */}
              <div className="grid gap-2">
                <Label htmlFor="locality">Locality / Area</Label>
                <Input
                  id="locality"
                  placeholder="e.g., Ulwe, Bandra, or Sector 10"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                />
              </div>

              {/* City/State (Remains) */}
              <div className="grid gap-2">
                <Label htmlFor="cityState">City, State</Label>
                <Input
                  id="cityState"
                  placeholder="e.g., Navi Mumbai, Maharashtra"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                />
              </div>

              {/* Project / Building Name (Remains) */}
              <div className="grid gap-2">
                <Label htmlFor="projectName">Project / Building Name (Optional)</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., Lodha Pallazio or Royal Towers"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              
              {/* --- CONDITIONAL PRICE INPUT --- */}
              {listingType === 'Sale' ? (
                <div className="grid gap-2">
                  <Label htmlFor="price-range">Sale Price Range</Label>
                  <Select value={salePriceRange} onValueChange={(v: PriceRange) => setSalePriceRange(v)}>
                    <SelectTrigger id="price-range" aria-label="Sale Price Range">
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
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="rentMonthly">Rent / Lease Terms</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      id="rentMonthly"
                      type="number"
                      placeholder="Monthly Rent (₹)"
                      value={rentMonthly}
                      onChange={(e) => setRentMonthly(e.target.value)}
                    />
                    <Input
                      id="rentDeposit"
                      type="text"
                      placeholder="Deposit / Lease Term"
                      value={rentDeposit}
                      onChange={(e) => setRentDeposit(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {/* --- END CONDITIONAL PRICE INPUT --- */}


              {/* Features & Amenities (Remains) */}
              <div className="grid gap-2">
                <Label htmlFor="features">Key Features & Amenities</Label>
                <Textarea
                  id="features"
                  placeholder="E.g., modular kitchen, balcony, covered parking, clubhouse, pool, power backup..."
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

              {/* Proximity / Landmarks (Remains) */}
              <div className="grid gap-2">
                <Label htmlFor="keyLandmarks">Proximity / Key Landmarks</Label>
                <Textarea
                  id="keyLandmarks"
                  placeholder="E.g., 5 mins walk to Metro Station, Near Reliance Mall, Next to D-Mart"
                  value={keyLandmarks}
                  onChange={(e) => setKeyLandmarks(e.target.value)}
                  rows={3}
                />
                <span className="text-xs text-muted-foreground">The AI will use these details to enhance the location narrative.</span>
              </div>

              {/* Tone (Remains) */}
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

              {/* Action (Remains) */}
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
          
          {/* Listing Description (Download button remains) */}
          <Card className="border shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Listing Description</CardTitle>
                <CardDescription>Polished, ready-to-use description.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadText(description, `propwrite_${listingType.toLowerCase()}_listing.txt`)}
                    disabled={!description || loading}
                    aria-disabled={!description || loading}
                >
                    Download (.txt)
                </Button>
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
              </div>
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

          {/* Social Post (Remains) */}
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

          {/* Hashtags + Upsell (Regenerate button remains) */}
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
                <p className="text-sm text-muted-foreground">Get a new variant?</p>
                <Button variant="secondary" onClick={handleGenerate} disabled={loading}>
                    Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}