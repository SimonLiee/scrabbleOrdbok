import * as Comlink from 'comlink'
import type { SearchRequest, SearchResponse } from '../lib/types.ts'
import { SearchEngine } from '../lib/search-engine.ts'
import { parseWordList } from '../lib/word-loader.ts'

let engine: SearchEngine | null = null

const api = {
  async init(baseUrl: string): Promise<{ wordCount: number }> {
    const url = `${baseUrl}nsf2025.txt`
    const response = await fetch(url)
    const text = await response.text()
    const words = parseWordList(text)
    engine = new SearchEngine(words)
    return { wordCount: words.length }
  },

  search(request: SearchRequest): SearchResponse {
    if (!engine) {
      throw new Error('Search engine not initialized. Call init() first.')
    }
    return engine.search(request)
  },
}

Comlink.expose(api)
