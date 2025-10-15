"use client"

import useSWR from "swr"
import { useState } from "react"
import { Home, Search, TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

type Generation = {
  id: number
  created_at: string
  property_type: string
  location: string | null
  price_range: string | null
  features: string | null
  tone: string | null
  description: string | null
  social_post: string | null
  hashtags: string[] | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminPage() {
  const [q, setQ] = useState("")
  const [page, setPage] = useState(0)
  const limit = 20
  const offset = page * limit

  const { data, isLoading, error } = useSWR<{ items: Generation[]; count: number }>(
    `/api/admin/generations?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`,
    fetcher,
  )

  const items = data?.items ?? []
  const count = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TableIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight">Admin · Generations</h1>
            <p className="text-sm text-muted-foreground">
              Review recent content generations and search by location/features.
            </p>
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link href="/" className="inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to App
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Generation Logs</CardTitle>
            <CardDescription>{count} total results</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search location or features"
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tone</TableHead>
                  <TableHead>Hashtags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-destructive">
                      Failed to load: {String(error)}
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="whitespace-nowrap">{new Date(g.created_at).toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{g.property_type}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{g.location}</TableCell>
                      <TableCell className="whitespace-nowrap">{g.price_range}</TableCell>
                      <TableCell className="whitespace-nowrap">{g.tone}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <div className="flex flex-wrap gap-1">
                          {(g.hashtags ?? []).slice(0, 6).map((h) => (
                            <Badge key={h} variant="secondary" className="text-[10px]">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
