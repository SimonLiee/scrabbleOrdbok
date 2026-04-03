export type SearchMode = 'text' | 'wildcard' | 'anagram'
export type SortMode = 'relevance' | 'alphabetical' | 'score' | 'length'
export type SortDirection = 'asc' | 'desc'

export interface SearchFilters {
  minLength: number
  maxLength: number
  mustContain: string
  mustNotContain: string
}

export interface SearchResult {
  word: string
  score: number
  length: number
}

export interface SearchRequest {
  query: string
  mode: SearchMode
  filters: SearchFilters
  sort: SortMode
  sortDirection: SortDirection
}

export interface SearchResponse {
  results: SearchResult[]
  totalMatches: number
  searchTimeMs: number
}
