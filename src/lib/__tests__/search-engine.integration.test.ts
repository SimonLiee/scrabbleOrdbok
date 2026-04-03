import { describe, expect, it, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { SearchEngine } from '../search-engine.ts'
import { parseWordList } from '../word-loader.ts'
import type { SearchFilters } from '../types.ts'

const DEFAULT_FILTERS: SearchFilters = {
  minLength: 1,
  maxLength: 33,
  mustContain: '',
  mustNotContain: '',
}

let engine: SearchEngine
let words: string[]

beforeAll(() => {
  const text = readFileSync(resolve(__dirname, '../../../public/nsf2025.txt'), 'utf-8')
  words = parseWordList(text)
  engine = new SearchEngine(words)
})

describe('Word list loading', () => {
  it('has 922,322 words', () => {
    expect(words.length).toBe(922_322)
  })

  it('all words are lowercase', () => {
    const hasUppercase = words.some((w) => w !== w.toLowerCase())
    expect(hasUppercase).toBe(false)
  })

  it('includes Norwegian characters', () => {
    const hasAe = words.some((w) => w.includes('æ'))
    const hasOe = words.some((w) => w.includes('ø'))
    const hasAa = words.some((w) => w.includes('å'))
    expect(hasAe).toBe(true)
    expect(hasOe).toBe(true)
    expect(hasAa).toBe(true)
  })
})

describe('Text search', () => {
  it('"hund" returns 1,623 results with default filters', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBe(1_623)
  })

  it('first result alphabetically starts with "a"', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results[0]!.word[0]).toBe('a')
  })

  it('results include compound words like "hundekjører"', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const words = response.results.map((r) => r.word)
    expect(words).toContain('hundekjører')
  })

  it('empty query returns 0 results', () => {
    const response = engine.search({
      query: '',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results).toHaveLength(0)
    expect(response.totalMatches).toBe(0)
  })
})

describe('Wildcard search', () => {
  it('"h?nd" returns exactly 5 results: hand, hend, hind, hond, hund', () => {
    const response = engine.search({
      query: 'h?nd',
      mode: 'wildcard',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const resultWords = response.results.map((r) => r.word)
    expect(response.totalMatches).toBe(5)
    expect(resultWords).toEqual(['hand', 'hend', 'hind', 'hund', 'hånd'])
  })

  it('"?å?" returns results and all are exactly 3 letters', () => {
    const response = engine.search({
      query: '?å?',
      mode: 'wildcard',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBeGreaterThan(0)
    for (const result of response.results) {
      expect(result.word.length).toBe(3)
    }
  })

  it('empty query returns 0 results', () => {
    const response = engine.search({
      query: '',
      mode: 'wildcard',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results).toHaveLength(0)
    expect(response.totalMatches).toBe(0)
  })
})

describe('Check word', () => {
  it('"hest" is a valid word', () => {
    const response = engine.search({
      query: 'hest',
      mode: 'check',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results).toHaveLength(1)
    expect(response.results[0]!.word).toBe('hest')
    expect(response.results[0]!.score).toBeGreaterThan(0)
    expect(response.totalMatches).toBe(1)
  })

  it('"xyzzyplugh" is not a valid word', () => {
    const response = engine.search({
      query: 'xyzzyplugh',
      mode: 'check',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results).toHaveLength(0)
    expect(response.totalMatches).toBe(0)
  })

  it('Norwegian characters work: "ål" is valid', () => {
    const response = engine.search({
      query: 'ål',
      mode: 'check',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results).toHaveLength(1)
    expect(response.results[0]!.word).toBe('ål')
  })

  it('never returns more than one word', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'check',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results.length).toBeLessThanOrEqual(1)
    expect(response.totalMatches).toBeLessThanOrEqual(1)
  })
})

describe('Anagram search', () => {
  it('"aelpp" returns results including "lappe", "leppa", "papel"', () => {
    const response = engine.search({
      query: 'aelpp',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const resultWords = response.results.map((r) => r.word)
    expect(resultWords).toContain('lappe')
    expect(resultWords).toContain('leppa')
    expect(resultWords).toContain('papel')
  })

  it('"hes?" (with blank tile) returns results including "hest"', () => {
    const response = engine.search({
      query: 'hes?',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const resultWords = response.results.map((r) => r.word)
    expect(resultWords).toContain('hest')
  })

  it('empty query returns 0 results', () => {
    const response = engine.search({
      query: '',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results).toHaveLength(0)
    expect(response.totalMatches).toBe(0)
  })

  it('"ieh" returns subset anagrams including 2-letter words', () => {
    const response = engine.search({
      query: 'ieh',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const resultWords = response.results.map((r) => r.word)
    expect(resultWords).toContain('hei')
    expect(resultWords).toContain('hi')
    expect(response.totalMatches).toBeGreaterThan(2)
  })

  it('"aelpp" with subset search returns both 5-letter and shorter words', () => {
    const response = engine.search({
      query: 'aelpp',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const resultWords = response.results.map((r) => r.word)
    expect(resultWords).toContain('lappe')
    expect(resultWords).toContain('leppa')
    expect(resultWords).toContain('papel')
    const hasShorterWords = response.results.some((r) => r.length < 5)
    expect(hasShorterWords).toBe(true)
  })

  it('subset anagram results only contain letters from the given set', () => {
    const response = engine.search({
      query: 'hest',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const availableLetters = ['h', 'e', 's', 't']
    for (const result of response.results) {
      const letterPool = [...availableLetters]
      for (const ch of result.word) {
        const idx = letterPool.indexOf(ch)
        expect(idx).toBeGreaterThanOrEqual(0)
        letterPool.splice(idx, 1)
      }
    }
  })

  it('anagram results respect alphabetical ascending sort', () => {
    const response = engine.search({
      query: 'aelpp',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const resultWords = response.results.map((r) => r.word)
    for (let i = 0; i < resultWords.length - 1; i++) {
      expect(resultWords[i]!.localeCompare(resultWords[i + 1]!, 'no')).toBeLessThanOrEqual(0)
    }
  })

  it('anagram results respect alphabetical descending sort', () => {
    const response = engine.search({
      query: 'aelpp',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'desc',
    })
    const resultWords = response.results.map((r) => r.word)
    for (let i = 0; i < resultWords.length - 1; i++) {
      expect(resultWords[i]!.localeCompare(resultWords[i + 1]!, 'no')).toBeGreaterThanOrEqual(0)
    }
  })

  it('anagram results respect score descending sort', () => {
    const response = engine.search({
      query: 'aelpp',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'score',
      sortDirection: 'desc',
    })
    const scores = response.results.map((r) => r.score)
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]!).toBeGreaterThanOrEqual(scores[i + 1]!)
    }
  })

  it('anagram results respect length ascending sort', () => {
    const response = engine.search({
      query: 'aelpp',
      mode: 'anagram',
      filters: DEFAULT_FILTERS,
      sort: 'length',
      sortDirection: 'asc',
    })
    const lengths = response.results.map((r) => r.length)
    for (let i = 0; i < lengths.length - 1; i++) {
      expect(lengths[i]!).toBeLessThanOrEqual(lengths[i + 1]!)
    }
  })
})

describe('Sort modes', () => {
  it('score sort: first result has score >= all subsequent results', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'score',
      sortDirection: 'desc',
    })
    const scores = response.results.map((r) => r.score)
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]!).toBeGreaterThanOrEqual(scores[i + 1]!)
    }
  })

  it('length sort: first result has length >= all subsequent results', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'length',
      sortDirection: 'desc',
    })
    const lengths = response.results.map((r) => r.length)
    for (let i = 0; i < lengths.length - 1; i++) {
      expect(lengths[i]!).toBeGreaterThanOrEqual(lengths[i + 1]!)
    }
  })

  it('alphabetical sort: results are in Norwegian alphabetical order', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    const resultWords = response.results.map((r) => r.word)
    for (let i = 0; i < resultWords.length - 1; i++) {
      expect(resultWords[i]!.localeCompare(resultWords[i + 1]!, 'no')).toBeLessThanOrEqual(0)
    }
  })

  it('relevance sort: exact match first, then startsWith, then contains', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'relevance',
      sortDirection: 'desc',
    })
    const resultWords = response.results.map((r) => r.word)
    expect(resultWords[0]).toBe('hund')

    const firstContainsIdx = resultWords.findIndex((w) => !w.startsWith('hund'))
    expect(firstContainsIdx).toBeGreaterThan(0)
    for (let i = 0; i < firstContainsIdx; i++) {
      expect(resultWords[i]!.startsWith('hund')).toBe(true)
    }
  })

  it('relevance sort: shorter startsWith matches rank higher', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'relevance',
      sortDirection: 'desc',
    })
    const startsWith = response.results.filter((r) => r.word.startsWith('hund'))
    for (let i = 0; i < startsWith.length - 1; i++) {
      expect(startsWith[i]!.length).toBeLessThanOrEqual(startsWith[i + 1]!.length)
    }
  })

  it('alphabetical descending: results are in reverse Norwegian alphabetical order', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'desc',
    })
    const resultWords = response.results.map((r) => r.word)
    for (let i = 0; i < resultWords.length - 1; i++) {
      expect(resultWords[i]!.localeCompare(resultWords[i + 1]!, 'no')).toBeGreaterThanOrEqual(0)
    }
  })

  it('score ascending: results go from lowest to highest score', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'score',
      sortDirection: 'asc',
    })
    const scores = response.results.map((r) => r.score)
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]!).toBeLessThanOrEqual(scores[i + 1]!)
    }
  })

  it('length ascending: results go from shortest to longest', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'length',
      sortDirection: 'asc',
    })
    const lengths = response.results.map((r) => r.length)
    for (let i = 0; i < lengths.length - 1; i++) {
      expect(lengths[i]!).toBeLessThanOrEqual(lengths[i + 1]!)
    }
  })
})

describe('Filters', () => {
  it('mustContain "ø": all results contain the letter ø', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, mustContain: 'ø' },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBeGreaterThan(0)
    for (const result of response.results) {
      expect(result.word).toContain('ø')
    }
  })

  it('mustNotContain "e": no results contain the letter e', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, mustNotContain: 'e' },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBeGreaterThan(0)
    for (const result of response.results) {
      expect(result.word).not.toContain('e')
    }
  })

  it('minLength 8: all results have length >= 8', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, minLength: 8 },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBeGreaterThan(0)
    for (const result of response.results) {
      expect(result.word.length).toBeGreaterThanOrEqual(8)
    }
  })

  it('maxLength 4: all results have length <= 4', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, maxLength: 4 },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBeGreaterThan(0)
    for (const result of response.results) {
      expect(result.word.length).toBeLessThanOrEqual(4)
    }
  })

  it('combined filters work together (minLength + mustContain)', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: { ...DEFAULT_FILTERS, minLength: 8, mustContain: 'e' },
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBeGreaterThan(0)
    for (const result of response.results) {
      expect(result.word.length).toBeGreaterThanOrEqual(8)
      expect(result.word).toContain('e')
    }
  })
})

describe('Result metadata', () => {
  it('each result has word (string), score (number > 0), length (number matching word.length)', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    for (const result of response.results) {
      expect(typeof result.word).toBe('string')
      expect(typeof result.score).toBe('number')
      expect(result.score).toBeGreaterThan(0)
      expect(typeof result.length).toBe('number')
      expect(result.length).toBe(result.word.length)
    }
  })

  it('searchTimeMs is a positive number', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.searchTimeMs).toBeGreaterThan(0)
  })

  it('totalMatches matches expected counts', () => {
    const response = engine.search({
      query: 'hund',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.totalMatches).toBe(1_623)
  })
})

describe('Result cap', () => {
  it('common prefix returns at most 10,000 results but totalMatches reports true count', () => {
    // "a" is a very common prefix, should have more than 10,000 words
    const response = engine.search({
      query: 'a',
      mode: 'text',
      filters: DEFAULT_FILTERS,
      sort: 'alphabetical',
      sortDirection: 'asc',
    })
    expect(response.results.length).toBeLessThanOrEqual(10_000)
    expect(response.totalMatches).toBeGreaterThan(10_000)
  })
})
