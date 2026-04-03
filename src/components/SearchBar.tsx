import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { KeyboardEvent } from "react"
import type { SearchMode } from "@/lib/types"

export interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  mode: SearchMode
  isSearching: boolean
}

export function SearchBar({
  query,
  onQueryChange,
  onSearch,
  mode,
  isSearching,
}: SearchBarProps) {
  const getPlaceholder = () => {
    switch (mode) {
      case "text":
        return "Søk etter ord... (bruk ? for ukjent bokstav)"
      case "anagram":
        return "Skriv bokstavene dine (f.eks. aelpp)"
      case "check":
        return "Skriv inn et ord for å sjekke om det er gyldig"
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSearch()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onQueryChange("")
    }
  }

  return (
    <div className="relative flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="pl-9 pr-10 h-12 text-base md:text-sm"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        {query && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            onClick={() => onQueryChange("")}
            aria-label="Tøm søk"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {(mode === "anagram" || mode === "check") && (
        <Button 
          onClick={onSearch} 
          disabled={isSearching || !query}
          className="h-12 px-6"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            mode === "check" ? "Sjekk" : "Søk"
          )}
        </Button>
      )}
    </div>
  )
}
