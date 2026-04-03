import type { ReactNode } from "react"
import { ThemeToggle } from "./ThemeToggle"
import { LETTER_SCORES } from "@/lib/scoring"

export function Layout({ children }: { children: ReactNode }) {
  const appName = "ScrabbleOrdbok"

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-[2px] sm:gap-1">
              {appName.split('').map((letter, i) => (
                <div
                  key={`${i}-${letter}`}
                  className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#f0e6d2] dark:bg-[#d8c5a1] text-[#3e2723] rounded shadow-sm border border-[#d3c2a6] dark:border-[#bda986] font-bold text-sm sm:text-base uppercase select-none"
                >
                  <span>{letter}</span>
                  <span className="absolute bottom-[1px] right-[1px] text-[7px] sm:text-[8px] leading-none font-medium text-[#5d4037]">
                    {LETTER_SCORES[letter.toLowerCase()] ?? 0}
                  </span>
                </div>
              ))}
            </h1>
            <span className="text-xs text-muted-foreground hidden sm:inline-block pl-1">
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
