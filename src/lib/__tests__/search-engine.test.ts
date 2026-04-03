import { describe, expect, it, beforeEach } from 'vitest'
import { SearchEngine } from '../search-engine.ts'
import type { SearchFilters } from '../types.ts'

const WORDS = [
  'hest',
  'hester',
  'hests',
  'bil',
  'biler',
  'test',
  'tester',
  'katt',
  'katte',
  'ål',
  'øre',
  'æra',
  'åpne',
  'abcd',
  'abce',
  'abcf',
]

const DEFAULT_FILTERS: SearchFilters = {
  minLength: 2,
  maxLength: 15,
  mustContain: '',
  mustNotContain: '',
}

let engine: SearchEngine

beforeEach(() => {
  engine = new SearchEngine(WORDS)
})

describe('textSearch', () => {
  it('returns startsWith matches first', () => {
    const results = engine.search({
      query: 'hest',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('hest')
    expect(words).toContain('hester')
    expect(words).toContain('hests')
  })

  it('returns empty for empty query', () => {
    const results = engine.search({
      query: '',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(results.results).toHaveLength(0)
  })

  it('returns contains matches as fallback', () => {
    const results = engine.search({
      query: 'est',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('hest')
    expect(words).toContain('test')
    expect(words).toContain('tester')
  })
})

describe('wildcardSearch', () => {
  it('matches ? as any single character', () => {
    const results = engine.search({
      query: 'h?st',
      mode: 'wildcard',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('hest')
    expect(words).not.toContain('hester')
  })

  it('matches multiple wildcards', () => {
    const results = engine.search({
      query: 'b??',
      mode: 'wildcard',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('bil')
  })

  it('returns empty for empty pattern', () => {
    const results = engine.search({
      query: '',
      mode: 'wildcard',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(results.results).toHaveLength(0)
  })
})

describe('anagramSearch', () => {
  it('finds exact anagrams', () => {
    const results = engine.search({
      query: 'hest',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('hest')
  })

  it('handles Norwegian characters', () => {
    const results = engine.search({
      query: 'æra',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('æra')
  })

  it('handles blank tiles with ?', () => {
    const results = engine.search({
      query: 'hes?',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('hest')
  })

  it('returns empty for empty query', () => {
    const results = engine.search({
      query: '',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(results.results).toHaveLength(0)
  })
})

describe('filters', () => {
  it('filters by minLength', () => {
    const results = engine.search({
      query: 'hest',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, minLength: 6 },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).not.toContain('hest')
    expect(words).toContain('hester')
  })

  it('filters by maxLength', () => {
    const results = engine.search({
      query: 'hest',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, maxLength: 4 },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('hest')
    expect(words).not.toContain('hester')
  })

  it('filters by mustContain', () => {
    const results = engine.search({
      query: 'katt',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, mustContain: 'e' },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('katte')
    expect(words).not.toContain('katt')
  })

  it('filters by mustNotContain', () => {
    const results = engine.search({
      query: 'bil',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, mustNotContain: 'r' },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words).toContain('bil')
    expect(words).not.toContain('biler')
  })
})

describe('sorting', () => {
  it('sorts alphabetically', () => {
    const results = engine.search({
      query: 'abc',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = results.results.map((r) => r.word)
    expect(words[0]).toBe('abcd')
    expect(words[1]).toBe('abce')
    expect(words[2]).toBe('abcf')
  })

  it('sorts by score descending', () => {
    const results = engine.search({
      query: 'abc',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'score',
      sortDirection: 'desc',
    })
    const scores = results.results.map((r) => r.score)
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]!).toBeGreaterThanOrEqual(scores[i + 1]!)
    }
  })

  it('sorts by length descending', () => {
    const results = engine.search({
      query: 'hest',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'length',
      sortDirection: 'desc',
    })
    const lengths = results.results.map((r) => r.length)
    for (let i = 0; i < lengths.length - 1; i++) {
      expect(lengths[i]!).toBeGreaterThanOrEqual(lengths[i + 1]!)
    }
  })

  it('sorts by relevance: exact match first, then startsWith by length', () => {
    const results = engine.search({
      query: 'hest',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'relevance',
      sortDirection: 'desc',
    })
    const words = results.results.map((r) => r.word)
    expect(words[0]).toBe('hest')
    expect(words[1]).toBe('hests')
    expect(words[2]).toBe('hester')

    const startsWith = results.results.filter((r) => r.word.startsWith('hest'))
    for (let i = 0; i < startsWith.length - 1; i++) {
      expect(startsWith[i]!.length).toBeLessThanOrEqual(startsWith[i + 1]!.length)
    }
  })

  it('sorts alphabetically descending (Å → A)', () => {
    const results = engine.search({
      query: 'abc',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'desc',
    })
    const words = results.results.map((r) => r.word)
    expect(words[0]).toBe('abcf')
    expect(words[1]).toBe('abce')
    expect(words[2]).toBe('abcd')
  })

  it('sorts by score ascending (lowest first)', () => {
    const results = engine.search({
      query: 'abc',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'score',
      sortDirection: 'asc',
    })
    const scores = results.results.map((r) => r.score)
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]!).toBeLessThanOrEqual(scores[i + 1]!)
    }
  })

  it('sorts by length ascending (shortest first)', () => {
    const results = engine.search({
      query: 'hest',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'length',
      sortDirection: 'asc',
    })
    const lengths = results.results.map((r) => r.length)
    for (let i = 0; i < lengths.length - 1; i++) {
      expect(lengths[i]!).toBeLessThanOrEqual(lengths[i + 1]!)
    }
  })
})

describe('result metadata', () => {
  it('includes totalMatches and searchTimeMs', () => {
    const response = engine.search({
      query: 'hest',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBeGreaterThan(0)
    expect(response.searchTimeMs).toBeGreaterThanOrEqual(0)
  })

  it('caps results at 10,000 but reports true totalMatches', () => {
    const manyWords = Array.from({ length: 15_000 }, (_, i) => `word${i}`)
    const bigEngine = new SearchEngine(manyWords)
    const response = bigEngine.search({
      query: 'word',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results).toHaveLength(10_000)
    expect(response.totalMatches).toBe(15_000)
  })

  it('each result includes word, score, and length', () => {
    const response = engine.search({
      query: 'hest',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    for (const result of response.results) {
      expect(typeof result.word).toBe('string')
      expect(typeof result.score).toBe('number')
      expect(typeof result.length).toBe('number')
      expect(result.length).toBe(result.word.length)
    }
  })
})
