import { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Card } from "@/components/ui/card"
import { WordRow } from "./WordRow"
import type { SearchResult } from "@/lib/types"
import { ResultsHeader } from "./ResultsHeader"

export interface ResultsListProps {
  results: SearchResult[]
  totalMatches: number
  searchTimeMs: number
  isSearching: boolean
  isLoading: boolean
  hasSearched: boolean
}

export function ResultsList({
  results,
  totalMatches,
  searchTimeMs,
  isSearching,
  isLoading,
  hasSearched,
}: ResultsListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 20,
    measureElement: (el) => el.getBoundingClientRect().height,
  })

  if (isLoading || (!hasSearched && !isSearching)) {
    return (
      <Card className="w-full flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-350px)] border-dashed border-2">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground text-sm">Laster ordlisten...</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium text-foreground mb-2">Klar for søk</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Velg søkemetode og skriv inn bokstaver over for å finne gyldige Scrabble-ord.
            </p>
          </>
        )}
      </Card>
    )
  }

  if (isSearching) {
    return (
      <Card className="w-full flex items-center justify-center p-12 h-[calc(100vh-350px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse">Søker...</p>
        </div>
      </Card>
    )
  }

  if (hasSearched && results.length === 0) {
    return (
      <Card className="w-full flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-350px)] bg-muted/10">
        <h3 className="text-lg font-medium text-foreground mb-2">Ingen treff</h3>
        <p className="text-muted-foreground text-sm">
          Fant ingen ord som oppfylte kriteriene dine. Prøv å justere filtrene eller sjekk stavingen.
        </p>
      </Card>
    )
  }

  return (
    <Card className="w-full flex flex-col overflow-hidden shadow-sm border">
      <ResultsHeader 
        totalMatches={totalMatches}
        displayedCount={results.length}
        searchTimeMs={searchTimeMs}
      />
      <div 
        ref={parentRef}
        className="w-full h-[calc(100vh-350px)] min-h-[300px] overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const result = results[virtualItem.index]
            return (
              <div
                key={virtualItem.index}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <WordRow result={result} />
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
