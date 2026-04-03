import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SearchResult } from "@/lib/types"

export interface WordRowProps {
  result: SearchResult
  className?: string
  style?: React.CSSProperties
}

export function WordRow({ result, className, style }: WordRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors",
        className
      )}
      style={style}
    >
      <div className="flex items-center">
        <span className="font-medium text-lg tracking-wide uppercase">
          {result.word}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="font-semibold text-sm h-6">
          {result.score} p
        </Badge>
        <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
          {result.length} b
        </span>
      </div>
    </div>
  )
}
