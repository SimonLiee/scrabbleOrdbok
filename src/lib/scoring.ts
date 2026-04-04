// Norwegian Scrabble letter values (NSF standard)
const LETTER_SCORES: Record<string, number> = {
  // 1 point
  a: 1, d: 1, e: 1, i: 1, l: 1, n: 1, r: 1, s: 1, t: 1,
  // 2 points
  f: 2, g: 2, k: 2, m: 2, o: 2,
  // 3 points
  h: 3,
  // 4 points
  b: 4, j: 4, p: 4, u: 4, v: 4, å: 4,
  // 5 points
  ø: 5,
  // 6 points
  y: 6, æ: 6,
  // 8 points
  w: 8,
  // 10 points
  c: 10, x: 10, z: 10, q: 10,
}

export function scoreWord(word: string): number {
  let total = 0
  for (const char of word.toLowerCase()) {
    total += LETTER_SCORES[char] ?? 0
  }
  return total
}

export { LETTER_SCORES }
