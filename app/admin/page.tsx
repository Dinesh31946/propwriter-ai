// dinesh31946/propwriter-ai/propwriter-ai-8fb7fd9ed2170095b9e5ea20cd26a171323e1ab5/app/admin/page.tsx

"use client"

import useSWR from "swr"
import { useState, useMemo } from "react"
import { Home, User, TableIcon, TrendingUp, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

// CHART COMPONENTS from recharts (Assumed available in package.json)
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Data Type for the aggregated data from the API's RPC call
type UserUsage = {
  user_uuid: string | null;
  total_generations: number;
}

const fetcher = (url: string) => fetch(url).then((r) => {
    if (!r.ok) {
        throw new Error(r.statusText === 'Forbidden' ? 'ACCESS DENIED: Not logged in as Admin.' : r.statusText);
    }
    return r.json();
})

// Mock ChartContainer component since its source was not provided
const ChartContainer = ({ children, className, config }: any) => (
  <div className={className}>
    {children}
  </div>
);


export default function AdminPage() {
  const { data, isLoading, error } = useSWR<{ items: UserUsage[]; count: number, anonymousCount: number }>(
    `/api/admin/generations`, 
    fetcher,
  )

  const items = data?.items ?? []
  const anonymousCount = data?.anonymousCount ?? 0;
  const totalSignedUpUsers = data?.count ?? 0;
  const MAX_FREE_GENERATIONS = 5; // From logic in route.ts

  // --- CHART DATA PROCESSING ---
  const chartData = useMemo(() => {
    // 1. Prepare data for the Bar Chart: Top 5 heavy users
    const heavyUsers = items
      .filter(u => u.total_generations > 0)
      .sort((a, b) => b.total_generations - a.total_generations)
      .slice(0, 5)
      .map(u => ({
        name: `User ${u.user_uuid?.substring(0, 4)}`,
        Generations: u.total_generations,
        isTarget: u.total_generations > MAX_FREE_GENERATIONS,
      }));

    // 2. Add an anonymous usage entry for cost estimation visibility
    if (anonymousCount > 0) {
        heavyUsers.push({
            name: 'Anonymous',
            Generations: anonymousCount,
            isTarget: false,
        });
    }

    return heavyUsers;
  }, [items, anonymousCount]);
  
  const conversionTargets = items.filter(u => u.total_generations > MAX_FREE_GENERATIONS).length;
  const totalGenerations = chartData.reduce((sum, item) => sum + item.Generations, 0);

  // Configuration for the ChartContainer (for coloring)
  const chartConfig = {
    Generations: {
      label: "Generations",
      color: "hsl(var(--primary))",
    },
  };
  // --- END CHART DATA PROCESSING ---


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TableIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight">PropWrite.AI Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Cost management, user adoption, and monetization tracking.
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

      {/* --- KPI CARDS: Monetization and Cost --- */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Signed Up Users</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalSignedUpUsers}</div>
                <p className="text-xs text-muted-foreground">Accounts created.</p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Generations (All Time)</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalGenerations}</div>
                <p className="text-xs text-muted-foreground">Key cost estimation metric.</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Targets</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{conversionTargets}</div>
                <p className="text-xs text-muted-foreground">Users over {MAX_FREE_GENERATIONS} free limit.</p>
            </CardContent>
        </Card>

         <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anonymous Usage</CardTitle>
                <Badge variant="secondary" className="text-[10px]">Unclaimed</Badge>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{anonymousCount}</div>
                <p className="text-xs text-muted-foreground">Needs conversion to sign up.</p>
            </CardContent>
        </Card>
      </div>
      {/* --- END KPI CARDS --- */}

      {/* --- VISUALIZATION SECTION --- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Top Usage Summary</CardTitle>
                <CardDescription>Top users by generation count (Cost Estimation).</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-4">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center"><p className="text-muted-foreground">Loading chart...</p></div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartBarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 'dataMax + 5']} 
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-popover text-popover-foreground border border-border p-2 text-sm rounded-md shadow-lg">
                                                    <p className="font-semibold">{payload[0].payload.name}</p>
                                                    <p className="text-muted-foreground">Generations: {payload[0].value}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="Generations" 
                                    fill="var(--color-Generations)" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </RechartBarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>

        {/* User Detail Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detailed User Usage List</CardTitle>
            <CardDescription>Accounts exceeding the free limit are key monetization targets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User UUID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Generations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-sm text-muted-foreground">Loading...</TableCell></TableRow>
                  ) : error ? (
                    <TableRow><TableCell colSpan={3} className="text-sm text-destructive font-medium">{String(error)}</TableCell></TableRow>
                  ) : items.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-sm text-muted-foreground">No signed-up users yet.</TableCell></TableRow>
                  ) : (
                    items.map((g, index) => {
                      const isConversionTarget = g.total_generations > MAX_FREE_GENERATIONS;
                      const statusText = isConversionTarget ? "Upgrade Target" : "Active Free";
                      
                      return (
                        <TableRow key={g.user_uuid}>
                          <TableCell className="max-w-[150px] truncate font-mono text-xs" title={g.user_uuid || 'Anonymous'}>
                              <User className="size-3 inline-block mr-2" />
                              {g.user_uuid ? `${g.user_uuid.substring(0, 8)}...` : 'N/A'}
                          </TableCell>
                          <TableCell>
                               <Badge 
                                  variant={isConversionTarget ? 'default' : 'secondary'}
                                  className={isConversionTarget ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                              >
                                  {statusText}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                              {g.total_generations}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* --- END VISUALIZATION SECTION --- */}
    </div>
  )
}