import { useCallback, useEffect, useRef, useState } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Layout } from '@/components/Layout'
import { SearchBar } from '@/components/SearchBar'
import { SearchModeSelector } from '@/components/SearchModeSelector'
import { FilterPanel } from '@/components/FilterPanel'
import { ResultsList } from '@/components/ResultsList'
import { SortControls } from '@/components/SortControls'
import { LoadingScreen } from '@/components/LoadingScreen'
import { CheckResult } from '@/components/CheckResult'
import { useSearch } from '@/hooks/useSearch'
import { useSearchParams } from '@/hooks/useSearchParams'
import type { SearchMode } from '@/lib/types'

function AppContent() {
  const {
    query,
    mode,
    filters,
    sort,
    sortDirection,
    setQuery,
    setMode,
    setSort,
    setSortDirection,
    setFilters,
  } = useSearchParams()

  const {
    isLoading,
    isSearching,
    results,
    totalMatches,
    searchTimeMs,
    error,
    search,
  } = useSearch()

  const [hasSearched, setHasSearched] = useState(false)
  const [lastCheckedQuery, setLastCheckedQuery] = useState('')
  const pendingCheckQueryRef = useRef('')
  const initialSearchDoneRef = useRef(false)

  const triggerSearch = useCallback(() => {
    if (!query.trim()) {
      return
    }
    setHasSearched(true)
    if (mode === 'check') {
      pendingCheckQueryRef.current = query.trim()
    }
    search(query, mode, filters, sort, sortDirection)
  }, [query, mode, filters, sort, sortDirection, search])

  // Auto-search for text/wildcard modes when query/filters/sort change
  useEffect(() => {
    if (isLoading) return
    if (mode === 'anagram' || mode === 'check') return
    if (!query.trim()) return

    setHasSearched(true)
    search(query, mode, filters, sort, sortDirection)
  }, [query, mode, filters, sort, sortDirection, isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-sort anagram results when sort/sortDirection changes (without requiring button press)
  useEffect(() => {
    if (isLoading) return
    if (mode !== 'anagram') return
    if (!hasSearched || !query.trim()) return

    search(query, mode, filters, sort, sortDirection)
  }, [sort, sortDirection]) // eslint-disable-line react-hooks/exhaustive-deps

  // If URL had a query on mount, trigger search after loading completes
  useEffect(() => {
    if (isLoading) return
    if (initialSearchDoneRef.current) return
    initialSearchDoneRef.current = true

    if (!query.trim()) return

    setHasSearched(true)
    if (mode === 'check') {
      pendingCheckQueryRef.current = query.trim()
    }
    search(query, mode, filters, sort, sortDirection)
  }, [isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync lastCheckedQuery atomically with results to prevent stale tiles
  useEffect(() => {
    if (mode === 'check' && !isSearching && pendingCheckQueryRef.current) {
      setLastCheckedQuery(pendingCheckQueryRef.current)
      pendingCheckQueryRef.current = ''
    }
  }, [isSearching, mode])

  const handleModeChange = useCallback(
    (newMode: SearchMode) => {
      setMode(newMode)
      if (newMode === 'check' || newMode === 'anagram') {
        setHasSearched(false)
        setLastCheckedQuery('')
      }
    },
    [setMode],
  )

  const handleSearch = useCallback(() => {
    triggerSearch()
  }, [triggerSearch])

  if (isLoading) {
    return <LoadingScreen />
  }

  const isCheckMode = mode === 'check'

  return (
    <Layout>
      {error && (
        <div className="rounded-md bg-destructive/15 text-destructive px-4 py-3 text-sm">
          Feil: {error}
        </div>
      )}

      <div className="space-y-4">
        <SearchModeSelector mode={mode} onModeChange={handleModeChange} />
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          mode={mode}
          isSearching={isSearching}
        />
        {!isCheckMode && <FilterPanel filters={filters} onFiltersChange={setFilters} />}
      </div>

      {isCheckMode ? (
        <CheckResult
          checkedWord={lastCheckedQuery}
          result={results[0] ?? null}
          hasSearched={hasSearched}
          isSearching={isSearching}
        />
      ) : (
        <div className="space-y-3">
          <SortControls sort={sort} sortDirection={sortDirection} onSortChange={setSort} onSortDirectionChange={setSortDirection} />
          <ResultsList
            results={results}
            totalMatches={totalMatches}
            searchTimeMs={searchTimeMs}
            isSearching={isSearching}
            isLoading={isLoading}
            hasSearched={hasSearched}
          />
        </div>
      )}
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="scrabble-ui-theme">
      <AppContent />
    </ThemeProvider>
  )
}

export default App
