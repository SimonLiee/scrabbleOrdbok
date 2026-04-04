import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import { LETTER_SCORES } from "@/lib/scoring"
import type { SearchResult } from "@/lib/types"

export interface CheckResultProps {
  checkedWord: string
  result: SearchResult | null
  hasSearched: boolean
  isSearching: boolean
  isLoading: boolean
}

export function CheckResult({ checkedWord, result, hasSearched, isSearching, isLoading }: CheckResultProps) {
  if (isLoading || (!hasSearched && !isSearching)) {
    return (
      <Card className="w-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Laster ordlisten...</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium text-foreground mb-2">Sjekk om et ord er gyldig</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Skriv inn et ord og trykk «Sjekk» for å se om det er godkjent i Scrabble.
            </p>
          </>
        )}
      </Card>
    )
  }

  if (isSearching) {
    return (
      <Card className="w-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Sjekker...</p>
        </div>
      </Card>
    )
  }

  const isValid = result !== null

  return (
    <Card className="w-full flex flex-col items-center justify-center p-8 sm:p-12 gap-6">
      <div className={`flex items-center gap-3 ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
        {isValid ? (
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        ) : (
          <XCircle className="w-10 h-10 sm:w-12 sm:h-12" />
        )}
        <span className="text-xl sm:text-2xl font-bold">
          {isValid ? 'Gyldig ord' : 'Ikke gyldig'}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1">
        {checkedWord.toLowerCase().split('').map((letter, i) => (
          <div
            key={`${i}-${letter}`}
            className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded shadow-sm border font-bold text-xl sm:text-2xl uppercase select-none ${
              isValid
                ? 'bg-[#f0e6d2] dark:bg-[#d8c5a1] text-[#3e2723] border-[#d3c2a6] dark:border-[#bda986]'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            <span>{letter}</span>
            <span className={`absolute bottom-[2px] right-[2px] text-[10px] sm:text-xs leading-none font-medium ${
              isValid ? 'text-[#5d4037]' : 'text-muted-foreground'
            }`}>
              {LETTER_SCORES[letter] ?? 0}
            </span>
          </div>
        ))}
      </div>

      {isValid && result && (
        <Badge variant="secondary" className="font-semibold text-lg px-4 py-1 bg-primary text-primary-foreground">
          {result.score} poeng
        </Badge>
      )}
    </Card>
  )
}
