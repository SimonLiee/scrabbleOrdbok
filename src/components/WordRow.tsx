import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SearchResult } from "@/lib/types"
import { LETTER_SCORES } from "@/lib/scoring"

export interface WordRowProps {
  result: SearchResult
  className?: string
  style?: React.CSSProperties
}

export function WordRow({ result, className, style }: WordRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors",
        className
      )}
      style={style}
    >
      <div className="flex flex-wrap items-center gap-1">
        {result.word.split('').map((letter, i) => (
          <div
            key={`${i}-${letter}`}
            className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-[#f0e6d2] dark:bg-[#d8c5a1] text-[#3e2723] rounded shadow-sm border border-[#d3c2a6] dark:border-[#bda986] font-bold text-lg md:text-xl uppercase select-none"
          >
            <span>{letter}</span>
            <span className="absolute bottom-[2px] right-[2px] text-[9px] md:text-[10px] leading-none font-medium text-[#5d4037]">
              {LETTER_SCORES[letter.toLowerCase()] ?? 0}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 ml-4">
        <Badge variant="secondary" className="font-semibold text-sm h-6 whitespace-nowrap bg-primary text-primary-foreground">
          {result.score} p
        </Badge>
        <span className="text-xs text-muted-foreground tabular-nums w-8 text-right whitespace-nowrap">
          {result.length} b
        </span>
      </div>
    </div>
  )
}
