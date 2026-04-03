import { useCallback, useEffect, useRef, useState } from 'react'
import * as Comlink from 'comlink'
import type { SearchFilters, SearchMode, SearchResult, SortDirection, SortMode } from '../lib/types.ts'

interface WorkerApi {
  init: (baseUrl: string) => Promise<{ wordCount: number }>
  search: (request: {
    query: string
    mode: SearchMode
    filters: SearchFilters
    sort: SortMode
    sortDirection: SortDirection
  }) => Promise<{ results: SearchResult[]; totalMatches: number; searchTimeMs: number }>
}

export function useSearch() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalMatches, setTotalMatches] = useState(0)
  const [searchTimeMs, setSearchTimeMs] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const workerApiRef = useRef<Comlink.Remote<WorkerApi> | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/search.worker.ts', import.meta.url),
      { type: 'module' },
    )
    const api = Comlink.wrap<WorkerApi>(worker)
    workerApiRef.current = api

    const baseUrl = import.meta.env.BASE_URL as string
    api
      .init(baseUrl)
      .then(({ wordCount: count }) => {
        setWordCount(count)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
        setIsLoading(false)
      })

    return () => {
      worker.terminate()
    }
  }, [])

  const search = useCallback(
    (query: string, mode: SearchMode, filters: SearchFilters, sort: SortMode, sortDirection: SortDirection) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      const doSearch = () => {
        const api = workerApiRef.current
        if (!api) return

        setIsSearching(true)
        api
          .search({ query, mode, filters, sort, sortDirection })
          .then(({ results: r, totalMatches: t, searchTimeMs: ms }) => {
            setResults(r)
            setTotalMatches(t)
            setSearchTimeMs(ms)
            setIsSearching(false)
          })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : String(err))
            setIsSearching(false)
          })
      }

      if (mode === 'anagram') {
        doSearch()
      } else {
        debounceTimerRef.current = setTimeout(doSearch, 300)
      }
    },
    [],
  )

  return {
    isLoading,
    isSearching,
    results,
    totalMatches,
    searchTimeMs,
    wordCount,
    error,
    search,
  }
}
