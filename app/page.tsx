import PropWriteApp from "@/components/propwrite/propwrite-app"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="min-h-dvh">
      <div className="container mx-auto flex items-center justify-end px-4 pt-4">
        {/* <Button variant="secondary" asChild>
          <Link href="/admin">Admin</Link>
        </Button> */}
      </div>
      <PropWriteApp />
    </main>
  )
}
