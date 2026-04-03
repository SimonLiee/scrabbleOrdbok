import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { Timer } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { LETTER_SCORES } from "@/lib/scoring"

function NavLink() {
  const { pathname } = useLocation()
  const isGame = pathname === "/spill"

  if (isGame) {
    return (
      <Link
        to="/"
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Ordbok
      </Link>
    )
  }

  return (
    <Link
      to="/spill"
      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      <Timer className="size-4" />
      <span className="hidden sm:inline">Spillklokke</span>
    </Link>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const appWords = ["Bok", "Stavern"]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-2 sm:gap-3">
              {appWords.map((word, wi) => (
                <span key={wi} className="flex items-center gap-[2px] sm:gap-1">
                  {word.split('').map((letter, li) => (
                    <span
                      key={`${wi}-${li}-${letter}`}
                      className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#f0e6d2] dark:bg-[#d8c5a1] text-[#3e2723] rounded shadow-sm border border-[#d3c2a6] dark:border-[#bda986] font-bold text-sm sm:text-base uppercase select-none"
                    >
                      <span>{letter}</span>
                      <span className="absolute bottom-[1px] right-[1px] text-[7px] sm:text-[8px] leading-none font-medium text-[#5d4037]">
                        {LETTER_SCORES[letter.toLowerCase()] ?? 0}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <span className="text-xs text-muted-foreground hidden sm:inline-block pl-1">
              Norsk Scrabble-ordbok
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NavLink />
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
            Ordliste: 922 321 ord ·{' '}
            <a
              href="https://www2.scrabbleforbundet.no/?page_id=1488"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Kilde
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
