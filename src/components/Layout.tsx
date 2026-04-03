import type { ReactNode } from "react"
import { ThemeToggle } from "./ThemeToggle"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">ScrabbleOrdbok</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Norsk Scrabble Ordbok — NSF 2025
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
        {children}
      </main>

      <footer className="border-t py-6 bg-muted/40 mt-auto">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            NSF 2025 ordliste — 922 321 ord
          </p>
        </div>
      </footer>
    </div>
  )
}
