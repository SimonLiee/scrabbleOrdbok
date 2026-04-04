import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SearchFilters, SearchMode } from "@/lib/types"

interface FilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  mode: SearchMode
}

const DEFAULT_FILTERS: SearchFilters = {
  minLength: 1,
  maxLength: 33,
  mustContain: "",
  mustNotContain: "",
}

export function FilterPanel({ filters, onFiltersChange, mode }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReset = () => {
    onFiltersChange(DEFAULT_FILTERS)
  }

  const handleChange = (key: keyof SearchFilters, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="w-full space-y-4">
      <div className="md:hidden">
        <Button
          variant="outline"
          className="w-full flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span>Filtre</span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </Button>
      </div>

      <div
        className={cn(
          `grid grid-cols-1 gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all`,
          mode === 'anagram' ? 'md:grid-cols-3' : 'md:grid-cols-4',
          !isOpen && "hidden md:grid"
        )}
      >
        <div className="space-y-2 col-span-1">
          <Label className="text-sm font-medium">Ordlengde (1-33)</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min={1}
              max={33}
              value={filters.minLength}
              onChange={(e) => handleChange("minLength", parseInt(e.target.value) || 1)}
              className="w-full h-9"
              aria-label="Minimum ordlengde"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min={1}
              max={33}
              value={filters.maxLength}
              onChange={(e) => handleChange("maxLength", parseInt(e.target.value) || 33)}
              className="w-full h-9"
              aria-label="Maksimum ordlengde"
            />
          </div>
        </div>

        <div className="space-y-2 col-span-1">
          <Label htmlFor="mustContain" className="text-sm font-medium">
            Må inneholde
          </Label>
          <Input
            id="mustContain"
            type="text"
            value={filters.mustContain}
            onChange={(e) => handleChange("mustContain", e.target.value)}
            placeholder="f.eks. æøå"
            className="w-full h-9"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

        {mode !== 'anagram' && (
          <div className="space-y-2 col-span-1">
            <Label htmlFor="mustNotContain" className="text-sm font-medium">
              Må ikke inneholde
            </Label>
            <Input
              id="mustNotContain"
              type="text"
              value={filters.mustNotContain}
              onChange={(e) => handleChange("mustNotContain", e.target.value)}
              placeholder="f.eks. zx"
              className="w-full h-9"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        )}

        <div className="col-span-1 flex items-end">
          <Button
            variant="secondary"
            onClick={handleReset}
            className="w-full h-9"
          >
            Nullstill
          </Button>
        </div>
      </div>
    </div>
  )
}
