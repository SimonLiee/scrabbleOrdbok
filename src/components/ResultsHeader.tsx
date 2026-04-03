export interface ResultsHeaderProps {
  totalMatches: number
  displayedCount: number
  searchTimeMs: number
}

export function ResultsHeader({
  totalMatches,
  displayedCount,
  searchTimeMs,
}: ResultsHeaderProps) {
  if (totalMatches === 0) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b text-sm text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
      <div className="font-medium">
        Viser {displayedCount.toLocaleString("no-NO")} av{" "}
        {totalMatches.toLocaleString("no-NO")} treff
        {totalMatches > displayedCount && (
          <span className="italic ml-1">(avkortet)</span>
        )}
      </div>
      <div className="tabular-nums opacity-80 hidden sm:block">
        Søk tok {searchTimeMs.toFixed(1)} ms
      </div>
    </div>
  )
}
