// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/components/propwrite/propwrite-app.tsx

"use client"

import { useMemo, useState } from "react"
import { Home, PenLine, Sparkles, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenuSeparator } from "../ui/dropdown-menu"

type PriceRange = "< ₹50L" | "₹50L–₹1Cr" | "₹1Cr–₹3Cr" | "₹3Cr+"
type Tone = "Professional (English)" | "Luxury (English)" | "Casual (Hinglish Blend)" | "Investor-focused (English)" | "Regional - Marathi/Local"
type ListingType = "Sale" | "Rent" | "Lease"

// --- UPDATED HELPER FUNCTION: DOWNLOADS ALL CONTENT ---
function downloadFullContent(content: {title: string, description: string, metaDescription: string, socialPost: string, hashtags: string[]}, listingType: ListingType) {
  const contentString = `
=====================================================
PROPERTY LISTING GENERATION PACKAGE (PropWrite.AI)
Transaction Type: ${listingType.toUpperCase()}
=====================================================

1. LISTING TITLE (Max 10 Words / Portal Field)
-----------------------------------------------------
${content.title}

2. LONG LISTING DESCRIPTION (300-450 Words / Main Body)
-----------------------------------------------------
${content.description}

3. SEO META DESCRIPTION (Max 160 Chars / Search Visibility)
-----------------------------------------------------
${content.metaDescription}

4. SOCIAL MEDIA POST (Short & Engaging Caption)
-----------------------------------------------------
${content.socialPost}

5. HASHTAGS
-----------------------------------------------------
${content.hashtags.join(' ')}

=====================================================
`;
  const element = document.createElement("a")
  const file = new Blob([contentString], { type: "text/plain" })
  element.href = URL.createObjectURL(file)
  element.download = `PropWrite_Content_Package_${listingType.toUpperCase()}.txt`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
// --- END UPDATED HELPER ---

export default function PropWriteApp() {
  // Form state
  const [propertyType, setPropertyType] = useState("Apartment")
  const [listingType, setListingType] = useState<ListingType>("Sale") 
  
  // Structured Location States
  const [locality, setLocality] = useState("") 
  const [cityState, setCityState] = useState("")
  
  // Conditional Price States
  const [salePriceExpectation, setSalePriceExpectation] = useState("") 
  const [rentMonthly, setRentMonthly] = useState("")
  const [rentDeposit, setRentDeposit] = useState("")
  
  // Consolidated Input
  const [propertySummary, setPropertySummary] = useState("") 
  
  const [tone, setTone] = useState<Tone>("Professional (English)")

  // States for Specs & New Landmarks/Project
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [area, setArea] = useState("") 
  const [projectName, setProjectName] = useState("")

  // Differentiator States
  const [reraNumber, setReraNumber] = useState("")
  const [possessionDate, setPossessionDate] = useState("")
  
  // Result/UX state
  const [loading, setLoading] = useState(false)
  // NEW STATE: Title
  const [title, setTitle] = useState("") 
  const [description, setDescription] = useState("")
  const [socialPost, setSocialPost] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [metaDescription, setMetaDescription] = useState("") 

  const wordsCount = useMemo(() => {
    const trimmed = propertySummary.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }, [propertySummary])


  async function handleGenerate() {
    setLoading(true)
    setTitle("")
    setDescription("")
    setSocialPost("")
    setHashtags([])
    setMetaDescription("")

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType,
          listingType, 
          locality,
          cityState,
          features: propertySummary,
          tone,
          bedrooms,
          bathrooms,
          area,
          projectName,
          reraNumber,
          possessionDate,
          salePriceExpectation: listingType === 'Sale' ? salePriceExpectation : undefined,
          rentMonthly: listingType !== 'Sale' ? rentMonthly : undefined,
          rentDeposit: listingType !== 'Sale' ? rentDeposit : undefined,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to generate content")
      }

      const data: {
        title: string
        description: string
        socialPost: string
        hashtags: string[]
        metaDescription: string
      } = await res.json()

      setTitle(data.title) // Set the new title state
      setDescription(data.description) 
      setSocialPost(data.socialPost)
      setHashtags(data.hashtags)
      setMetaDescription(data.metaDescription)
    } catch (err) {
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

  // Define the full content package object for the download button
  const fullContentPackage = {
      title,
      description,
      metaDescription,
      socialPost,
      hashtags,
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: Input Form (No changes needed from last step) */}
        <Card className="border">
          {/* ... (Input form content remains the same) ... */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" aria-hidden="true" />
              Property Details
            </CardTitle>
            <CardDescription>Enter essential information to begin generation.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              
              {/* ROW 1: Listing Type & Property Type */}
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="property-type">Property Type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger id="property-type" aria-label="Property Type">
                      <SelectValue placeholder="Select type" />
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
              </div>

              {/* ROW 2: Bedrooms, Bathrooms, Area */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Beds</Label>
                  <Input id="bedrooms" type="number" placeholder="e.g., 3" min="1" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms">Baths</Label>
                  <Input id="bathrooms" type="number" placeholder="e.g., 2" min="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area">Area</Label>
                  <Input id="area" placeholder="e.g., 1030 sq.ft" value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
              </div>
              
              <Separator className="my-2" />

              {/* ROW 3: LOCATION (Locality & City/State) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="locality">Locality / Area</Label>
                  <Input id="locality" placeholder="e.g., Ulwe, Bandra" value={locality} onChange={(e) => setLocality(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cityState">City, State</Label>
                  <Input id="cityState" placeholder="e.g., Navi Mumbai" value={cityState} onChange={(e) => setCityState(e.target.value)} />
                </div>
              </div>
              
              {/* ROW 4: PROJECT & PRICE (Dynamic) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="projectName">Project / Building Name (Optional)</Label>
                  <Input id="projectName" placeholder="e.g., Progressive Grande" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                </div>
                {/* CONDITIONAL PRICE INPUT */}
                <div className="grid gap-2">
                  <Label htmlFor={listingType === 'Sale' ? 'salePriceExpectation' : 'rentMonthly'}>
                    {listingType === 'Sale' ? 'Expected Sale Price' : 'Monthly Rent (₹)'}
                  </Label>
                  {listingType === 'Sale' ? (
                    <Input id="salePriceExpectation" type="text" placeholder="e.g., ₹2.5 Cr or ₹90 Lakhs" value={salePriceExpectation} onChange={(e) => setSalePriceExpectation(e.target.value)} />
                  ) : (
                    <Input id="rentMonthly" type="number" placeholder="e.g., 45000" value={rentMonthly} onChange={(e) => setRentMonthly(e.target.value)} />
                  )}
                </div>
              </div>
              
              {/* --- CONSOLIDATED TEXT INPUT (THE BIG WIN) --- */}
              <div className="grid gap-2">
                <Label htmlFor="propertySummary" className="font-semibold">
                    Property Summary (Amenities, Keywords, & Proximity)
                </Label>
                <Textarea
                  id="propertySummary"
                  placeholder="Paste your notes here: 
                  - Modular kitchen, balcony, clubhouse, pool, power backup. (Amenities)
                  - 5 mins walk to Metro Station, Near D-Mart. (Proximity)
                  - Target Keywords: premium 3 BHK Ulwe, sea view apartment Mumbai. (SEO)"
                  value={propertySummary}
                  onChange={(e) => setPropertySummary(e.target.value)}
                  rows={8}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span aria-hidden="true">{wordsCount} words</span>
                  <span>Tip: The AI will structure this text automatically.</span>
                </div>
              </div>
              {/* --- END CONSOLIDATED TEXT INPUT --- */}

              {/* ROW 6: TONE & COMPLIANCE (Optional) */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tone">Tone & Language Style</Label>
                    <Select value={tone} onValueChange={(v: Tone) => setTone(v)}>
                      <SelectTrigger id="tone" aria-label="Tone & Language Style">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Professional (English)">Professional (Standard English)</SelectItem>
                          <SelectItem value="Luxury (English)">Luxury (Standard English)</SelectItem>
                          <SelectItem value="Investor-focused (English)">Investor-focused (Standard English)</SelectItem>
                          <DropdownMenuSeparator />
                          <SelectItem value="Casual (Hinglish Blend)">Casual (Hinglish Blend)</SelectItem>
                          <SelectItem value="Regional - Marathi/Local">Regional - Marathi/Local</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="reraNumber">RERA Number (Optional)</Label> 
                      <Input id="reraNumber" placeholder="e.g., P52000021234" value={reraNumber} onChange={(e) => setReraNumber(e.target.value)} />
                  </div>
              </div>

              {/* ROW 7: POSSESSION DATE & DEPOSIT (Conditional) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="possessionDate">Possession Date (Optional)</Label>
                    <Input id="possessionDate" placeholder="e.g., Jun 2025 or Ready to Move" value={possessionDate} onChange={(e) => setPossessionDate(e.target.value)} />
                </div>
                {listingType !== 'Sale' && (
                    <div className="grid gap-2">
                        <Label htmlFor="rentDeposit">Deposit / Lease Term</Label>
                        <Input id="rentDeposit" type="text" placeholder="e.g., 2 months deposit" value={rentDeposit} onChange={(e) => setRentDeposit(e.target.value)} />
                    </div>
                )}
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
          
          {/* --- NEW OUTPUT: LISTING TITLE --- */}
          <Card className="border shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">Listing Title</CardTitle>
              <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(title)}
                  disabled={!title || loading}
                  aria-disabled={!title || loading}
              >
                  <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                  Copy Title
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                  <Skeleton className="h-8 w-full" />
              ) : title ? (
                  <p className="text-xl font-medium">{title}</p>
              ) : (
                  <p className="text-sm text-muted-foreground">Your attention-grabbing title will appear here.</p>
              )}
            </CardContent>
          </Card>


          {/* Listing Description (Download button updated) */}
          <Card className="border shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Listing Description</CardTitle>
                <CardDescription>Polished, ready-to-use description.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* NEW DOWNLOAD BUTTON: Downloads the entire package */}
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => downloadFullContent(fullContentPackage, listingType)}
                    disabled={!description || loading}
                    aria-disabled={!description || loading}
                >
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Download Full Package
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

          {/* SEO Meta Description (Remains) */}
          <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                      <CardTitle>SEO Meta Description</CardTitle>
                      <CardDescription>Optimized for Google & Property Portals (max ~160 chars).</CardDescription>
                  </div>
                  <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(metaDescription)}
                      disabled={!metaDescription || loading}
                      aria-disabled={!metaDescription || loading}
                  >
                      <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                      Copy Meta
                  </Button>
              </CardHeader>
              <CardContent>
                  {loading ? (
                      <Skeleton className="h-10 w-full" />
                  ) : metaDescription ? (
                      <Textarea value={metaDescription} readOnly rows={2} className="resize-none" />
                  ) : (
                      <p className="text-sm text-muted-foreground">The AI will generate a concise, keyword-optimized snippet.</p>
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

          {/* Hashtags + Upsell (Remains) */}
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