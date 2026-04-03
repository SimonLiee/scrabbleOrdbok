export function parseWordList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0)
}

export function sortLetters(word: string): string {
  return word.split('').sort().join('')
}

export function buildAnagramIndex(words: string[]): Map<string, number[]> {
  const index = new Map<string, number[]>()
  for (let i = 0; i < words.length; i++) {
    const key = sortLetters(words[i]!)
    const existing = index.get(key)
    if (existing) {
      existing.push(i)
    } else {
      index.set(key, [i])
    }
  }
  return index
}

export function buildLengthIndex(words: string[]): Map<number, number[]> {
  const index = new Map<number, number[]>()
  for (let i = 0; i < words.length; i++) {
    const len = words[i]!.length
    const existing = index.get(len)
    if (existing) {
      existing.push(i)
    } else {
      index.set(len, [i])
    }
  }
  return index
}
