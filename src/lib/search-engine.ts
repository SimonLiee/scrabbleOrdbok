import type { SearchFilters, SearchRequest, SearchResponse, SortDirection, SortMode } from './types.ts'
import { scoreWord } from './scoring.ts'
import { buildAnagramIndex, buildLengthIndex, sortLetters } from './word-loader.ts'

const NORWEGIAN_LETTERS = 'abcdefghijklmnopqrstuvwxyzæøå'
const MAX_RESULTS = 10_000

export class SearchEngine {
  private readonly words: string[]
  private readonly anagramIndex: Map<string, number[]>
  private readonly lengthIndex: Map<number, number[]>

  constructor(words: string[]) {
    this.words = words
    this.anagramIndex = buildAnagramIndex(words)
    this.lengthIndex = buildLengthIndex(words)
  }

  search(request: SearchRequest): SearchResponse {
    const start = performance.now()
    const { query, mode, filters, sort, sortDirection } = request

    let indices: number[]
    switch (mode) {
      case 'text':
        indices = this.textSearch(query, this.words, filters)
        break
      case 'wildcard':
        indices = this.wildcardSearch(query, this.words, filters)
        break
      case 'anagram':
        indices = this.anagramSearch(query, this.words, filters)
        break

    }

    const totalMatches = indices.length
    const capped = indices.slice(0, MAX_RESULTS)
    const results = this.buildResults(capped, sort, sortDirection, query.toLowerCase())
    const searchTimeMs = performance.now() - start

    return { results, totalMatches, searchTimeMs }
  }

  textSearch(query: string, words: string[], filters: SearchFilters): number[] {
    const q = query.toLowerCase()
    if (!q) return []

    const startsWithMatches: number[] = []
    const containsMatches: number[] = []

    for (let i = 0; i < words.length; i++) {
      const word = words[i]!
      if (!this.passesFilters(word, filters)) continue
      if (word.startsWith(q)) {
        startsWithMatches.push(i)
      } else if (word.includes(q)) {
        containsMatches.push(i)
      }
    }

    return [...startsWithMatches, ...containsMatches]
  }

  wildcardSearch(pattern: string, words: string[], filters: SearchFilters): number[] {
    const p = pattern.toLowerCase()
    if (!p) return []

    const exactLength = p.includes('?') ? p.length : null
    const escaped = p.replace(/[.+*^${}()|[\]\\]/g, '\\$&').replace(/\?/g, '.')
    const regex = new RegExp(`^${escaped}$`)

    const candidates =
      exactLength !== null
        ? (this.lengthIndex.get(exactLength) ?? [])
        : Array.from({ length: words.length }, (_, i) => i)

    const results: number[] = []
    for (const i of candidates) {
      const word = words[i]!
      if (!this.passesFilters(word, filters)) continue
      if (regex.test(word)) results.push(i)
    }
    return results
  }

  anagramSearch(letters: string, words: string[], filters: SearchFilters): number[] {
    const l = letters.toLowerCase()
    if (!l) return []

    const blankCount = (l.match(/\?/g) ?? []).length
    const fixedLetters = l.replace(/\?/g, '')
    const matchedIndices = new Set<number>()
    const checkedKeys = new Set<string>()

    const processLetterSet = (letterSet: string) => {
      const sorted = sortLetters(letterSet)
      const subsets = this.generateSortedSubsets(sorted, 2)
      for (const key of subsets) {
        if (checkedKeys.has(key)) continue
        checkedKeys.add(key)
        const indices = this.anagramIndex.get(key)
        if (indices) {
          for (const i of indices) {
            if (!matchedIndices.has(i)) {
              const word = words[i]!
              if (this.passesFilters(word, filters)) {
                matchedIndices.add(i)
              }
            }
          }
        }
      }
    }

    if (blankCount === 0) {
      processLetterSet(fixedLetters)
    } else {
      this.expandBlanks(fixedLetters, blankCount, processLetterSet)
    }

    return Array.from(matchedIndices)
  }

  applyFilters(indices: number[], filters: SearchFilters): number[] {
    return indices.filter((i) => this.passesFilters(this.words[i]!, filters))
  }

  private passesFilters(word: string, filters: SearchFilters): boolean {
    const { minLength, maxLength, mustContain, mustNotContain } = filters
    if (word.length < minLength || word.length > maxLength) return false
    if (mustContain) {
      for (const ch of mustContain.toLowerCase()) {
        if (!word.includes(ch)) return false
      }
    }
    if (mustNotContain) {
      for (const ch of mustNotContain.toLowerCase()) {
        if (word.includes(ch)) return false
      }
    }
    return true
  }

  private expandBlanks(
    fixed: string,
    blanksLeft: number,
    callback: (expanded: string) => void,
  ): void {
    if (blanksLeft === 0) {
      callback(fixed)
      return
    }
    for (const letter of NORWEGIAN_LETTERS) {
      this.expandBlanks(fixed + letter, blanksLeft - 1, callback)
    }
  }

  private generateSortedSubsets(sorted: string, minLen: number): string[] {
    const results: string[] = []
    const seen = new Set<string>()
    const chars = sorted.split('')

    const recurse = (start: number, current: string) => {
      if (current.length >= minLen) {
        if (!seen.has(current)) {
          seen.add(current)
          results.push(current)
        }
      }
      if (current.length === chars.length) return
      for (let i = start; i < chars.length; i++) {
        if (i > start && chars[i] === chars[i - 1]) continue
        recurse(i + 1, current + chars[i])
      }
    }

    recurse(0, '')
    return results
  }

  private buildResults(indices: number[], sort: SortMode, sortDirection: SortDirection, query: string): Array<{ word: string; score: number; length: number }> {
    const results = indices.map((i) => {
      const word = this.words[i]!
      return { word, score: scoreWord(word), length: word.length }
    })

    const dir = sortDirection === 'asc' ? 1 : -1

    switch (sort) {
      case 'relevance': {
        // Relevance ignores sortDirection — always best match first
        const q = query
        results.sort((a, b) => {
          const aExact = a.word === q ? 0 : a.word.startsWith(q) ? 1 : 2
          const bExact = b.word === q ? 0 : b.word.startsWith(q) ? 1 : 2
          if (aExact !== bExact) return aExact - bExact
          if (aExact === 2) {
            const aPos = a.word.indexOf(q)
            const bPos = b.word.indexOf(q)
            if (aPos !== bPos) return aPos - bPos
          }
          return a.length - b.length
        })
        break
      }
      case 'alphabetical':
        results.sort((a, b) => dir * a.word.localeCompare(b.word, 'no'))
        break
      case 'score':
        results.sort((a, b) => dir * (a.score - b.score))
        break
      case 'length':
        results.sort((a, b) => dir * (a.length - b.length))
        break
    }

    return results
  }
}
