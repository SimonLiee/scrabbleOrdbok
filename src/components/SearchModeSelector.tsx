import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SearchMode } from "@/lib/types"

export interface SearchModeSelectorProps {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
}

export function SearchModeSelector({ mode, onModeChange }: SearchModeSelectorProps) {
  return (
    <div className="w-full">
      <Tabs
        value={mode}
        onValueChange={(value) => onModeChange(value as SearchMode)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 h-auto sm:h-10 gap-1 p-1">
          <TabsTrigger value="text" className="text-xs sm:text-sm">
            Søk
          </TabsTrigger>
          <TabsTrigger value="wildcard" className="text-xs sm:text-sm">
            Jokertegn (?)
          </TabsTrigger>
          <TabsTrigger value="anagram" className="text-xs sm:text-sm">
            Anagram
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
