import { ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp01 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { SortDirection, SortMode } from "@/lib/types"

interface SortControlsProps {
  sort: SortMode
  sortDirection: SortDirection
  onSortChange: (sort: SortMode) => void
  onSortDirectionChange: (direction: SortDirection) => void
}

const DIRECTION_LABELS: Record<SortMode, { asc: string; desc: string }> = {
  relevance: { asc: '', desc: '' },
  alphabetical: { asc: 'A → Å', desc: 'Å → A' },
  score: { asc: 'Lavest først', desc: 'Høyest først' },
  length: { asc: 'Kortest først', desc: 'Lengst først' },
}

export function SortControls({ sort, sortDirection, onSortChange, onSortDirectionChange }: SortControlsProps) {
  const isRelevance = sort === 'relevance'
  const isAlpha = sort === 'alphabetical'
  const dirLabel = DIRECTION_LABELS[sort][sortDirection]

  const DirectionIcon = isAlpha
    ? (sortDirection === 'asc' ? ArrowDownAZ : ArrowUpAZ)
    : (sortDirection === 'asc' ? ArrowUp01 : ArrowDown01)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Sorter etter:
      </span>
      <div className="flex items-center gap-2">
        <ToggleGroup
          value={[sort]}
          onValueChange={(value) => {
            if (value && value.length > 0) onSortChange(value[0] as SortMode)
          }}
          className="justify-start bg-muted/40 p-1 rounded-lg border"
        >
          <ToggleGroupItem
            value="relevance"
            aria-label="Relevans"
            className="h-8 px-3 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            Relevans
          </ToggleGroupItem>
          <ToggleGroupItem
            value="alphabetical"
            aria-label="Alfabetisk"
            className="h-8 px-3 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            A-Å
          </ToggleGroupItem>
          <ToggleGroupItem
            value="score"
            aria-label="Poeng"
            className="h-8 px-3 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            Poeng
          </ToggleGroupItem>
          <ToggleGroupItem
            value="length"
            aria-label="Lengde"
            className="h-8 px-3 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            Lengde
          </ToggleGroupItem>
        </ToggleGroup>

        {!isRelevance && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs sm:text-sm"
            onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
            aria-label={`Sorteringsretning: ${dirLabel}`}
          >
            <DirectionIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{dirLabel}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
