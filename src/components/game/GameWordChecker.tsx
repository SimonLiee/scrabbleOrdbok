import { useCallback, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Search, Loader2, CheckCircle2, XCircle, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSearch } from '@/hooks/useSearch'
import { LETTER_SCORES } from '@/lib/scoring'
import type { SearchResult } from '@/lib/types'
import type { KeyboardEvent } from 'react'

export function GameWordChecker() {
  const { isLoading, isSearching, results, search } = useSearch()

  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [hasChecked, setHasChecked] = useState(false)
  const [checkedWord, setCheckedWord] = useState('')
  const [checkedResult, setCheckedResult] = useState<SearchResult | null>(null)
  const pendingQueryRef = useRef('')

  const triggerCheck = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed || isLoading) return
    pendingQueryRef.current = trimmed
    setHasChecked(false)
    search(trimmed, 'check', { minLength: 2, maxLength: 15, mustContain: '', mustNotContain: '' }, 'relevance', 'desc')
  }, [query, isLoading, search])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      triggerCheck()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setQuery('')
    }
  }

  const prevSearchingRef = useRef(false)
  if (prevSearchingRef.current && !isSearching && pendingQueryRef.current) {
    const word = pendingQueryRef.current
    pendingQueryRef.current = ''
    setCheckedWord(word)
    setCheckedResult(results[0] ?? null)
    setHasChecked(true)
  }
  prevSearchingRef.current = isSearching

  const isValid = checkedResult !== null

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors rounded-xl"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            Sjekk ord
          </span>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/60">
            <div className="flex items-center gap-2 pt-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Skriv et ord..."
                  className="pr-8 h-9 text-sm"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={isLoading}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setHasChecked(false) }}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground"
                    aria-label="Tøm"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <Button
                onClick={triggerCheck}
                disabled={isSearching || !query.trim() || isLoading}
                size="sm"
                className="h-9 px-4 shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  'Sjekk'
                )}
              </Button>
            </div>

            {hasChecked && checkedWord && (
              <div className="flex flex-col gap-2">
                <div className={`flex items-center gap-2 text-sm font-semibold ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {isValid ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <XCircle className="size-4 shrink-0" />
                  )}
                  <span>{isValid ? 'Gyldig ord' : 'Ikke gyldig'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-0.5">
                  {checkedWord.toLowerCase().split('').map((letter, i) => (
                    <div
                      key={`${i}-${letter}`}
                      className={`relative flex items-center justify-center w-8 h-8 rounded shadow-sm border font-bold text-base uppercase select-none ${
                        isValid
                          ? 'bg-[#f0e6d2] dark:bg-[#d8c5a1] text-[#3e2723] border-[#d3c2a6] dark:border-[#bda986]'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      <span>{letter}</span>
                      <span className={`absolute bottom-[2px] right-[2px] text-[8px] leading-none font-medium ${isValid ? 'text-[#5d4037]' : 'text-muted-foreground'}`}>
                        {LETTER_SCORES[letter] ?? 0}
                      </span>
                    </div>
                  ))}
                </div>

                {isValid && checkedResult && (
                  <Badge
                    variant="secondary"
                    className="w-fit text-xs px-2 py-0.5 bg-primary text-primary-foreground"
                  >
                    {checkedResult.score} poeng
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
