import { useCallback, useEffect, useState } from 'react'
import type { SearchFilters, SearchMode, SortDirection, SortMode } from '../lib/types.ts'

interface SearchParamsState {
  query: string
  mode: SearchMode
  filters: SearchFilters
  sort: SortMode
  sortDirection: SortDirection
}

const DEFAULT_FILTERS: SearchFilters = {
  minLength: 1,
  maxLength: 33,
  mustContain: '',
  mustNotContain: '',
}

function getDefaultDirection(sort: SortMode): SortDirection {
  return sort === 'alphabetical' ? 'asc' : 'desc'
}

function readFromURL(): SearchParamsState {
  const params = new URLSearchParams(window.location.search)

  const rawMode = params.get('mode')
  const mode: SearchMode =
    rawMode === 'wildcard' || rawMode === 'anagram' || rawMode === 'text' || rawMode === 'check'
      ? rawMode
      : 'text'

  const rawSort = params.get('sort')
  const sort: SortMode =
    rawSort === 'relevance' || rawSort === 'score' || rawSort === 'length' || rawSort === 'alphabetical'
      ? rawSort
      : 'relevance'

  const rawDir = params.get('dir')
  const sortDirection: SortDirection =
    rawDir === 'asc' || rawDir === 'desc' ? rawDir : getDefaultDirection(sort)

  const minLength = parseInt(params.get('minLen') ?? '', 10)
  const maxLength = parseInt(params.get('maxLen') ?? '', 10)

  return {
    query: params.get('q') ?? '',
    mode,
    sort,
    sortDirection,
    filters: {
      minLength: Number.isNaN(minLength) ? DEFAULT_FILTERS.minLength : minLength,
      maxLength: Number.isNaN(maxLength) ? DEFAULT_FILTERS.maxLength : maxLength,
      mustContain: params.get('has') ?? '',
      mustNotContain: params.get('not') ?? '',
    },
  }
}

function writeToURL(state: SearchParamsState): void {
  const params = new URLSearchParams()

  if (state.query) params.set('q', state.query)
  if (state.mode !== 'text') params.set('mode', state.mode)
  if (state.sort !== 'relevance') params.set('sort', state.sort)
  if (state.sortDirection !== getDefaultDirection(state.sort))
    params.set('dir', state.sortDirection)
  if (state.filters.minLength !== DEFAULT_FILTERS.minLength)
    params.set('minLen', String(state.filters.minLength))
  if (state.filters.maxLength !== DEFAULT_FILTERS.maxLength)
    params.set('maxLen', String(state.filters.maxLength))
  if (state.filters.mustContain) params.set('has', state.filters.mustContain)
  if (state.filters.mustNotContain) params.set('not', state.filters.mustNotContain)

  const search = params.toString()
  const newUrl = search
    ? `${window.location.pathname}?${search}`
    : window.location.pathname
  window.history.replaceState(null, '', newUrl)
}

export function useSearchParams() {
  const [state, setState] = useState<SearchParamsState>(readFromURL)

  useEffect(() => {
    writeToURL(state)
  }, [state])

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }))
  }, [])

  const setMode = useCallback((mode: SearchMode) => {
    setState((prev) => ({ ...prev, mode }))
  }, [])

  const setSort = useCallback((sort: SortMode) => {
    setState((prev) => ({ ...prev, sort, sortDirection: getDefaultDirection(sort) }))
  }, [])

  const setSortDirection = useCallback((sortDirection: SortDirection) => {
    setState((prev) => ({ ...prev, sortDirection }))
  }, [])

  const setFilters = useCallback((filters: SearchFilters) => {
    setState((prev) => ({ ...prev, filters }))
  }, [])

  return {
    query: state.query,
    mode: state.mode,
    filters: state.filters,
    sort: state.sort,
    sortDirection: state.sortDirection,
    setQuery,
    setMode,
    setSort,
    setSortDirection,
    setFilters,
  }
}
